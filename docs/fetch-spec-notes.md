# Notes sur les tests de `fetch` et `useProducts`

Ce document complète [`fetch-notes.md`](./fetch-notes.md) et se concentre sur
Vitest, React Testing Library et MSW.

## Fixtures

Une **fixture** est un jeu de données connu et stable, préparé pour placer le
code dans une situation reproductible.

Dans le projet, `src/mocks/data/products.ts` est la fixture principale du
catalogue :

```ts
export const products = [
  // Produits connus par les tests.
] satisfies Product[]
```

Une fixture n’est pas le système simulant le réseau. Elle représente seulement
les données utilisées par ce système ou directement par les tests.

```text
fixture produits
      ↓
handler MSW
      ↓
réponse HTTP simulée
      ↓
code testé
```

Une fixture déterministe garantit que le test ne dépend ni d’Internet, ni d’un
catalogue externe susceptible de changer.

## Handlers MSW et surcharge avec `server.use`

Le handler déclaré dans `src/mocks/handlers.ts` définit le comportement normal
de l’API simulée.

Dans un test, `server.use` ajoute temporairement un handler prioritaire :

```ts
server.use(
  http.get('/api/products', () => {
    return new HttpResponse(null, {
      status: 503,
      statusText: 'Service Unavailable',
    })
  }),
)
```

Pour ce test, ce handler surcharge donc la réponse normale de la même route.
`server.resetHandlers()` restaure ensuite les handlers initiaux afin d’éviter
qu’un scénario contamine les tests suivants.

## Pourquoi un seul statut `503` couvre `!response.ok`

Le mot **branche** désigne ici l’un des chemins possibles dans le flux de
contrôle du programme.

```ts
if (!response.ok) {
  // Branche d’erreur
}

// Branche de succès
```

Le code de `fetchProducts` prend seulement deux décisions :

```text
response.ok === true  → lire et retourner les données
response.ok === false → lancer une erreur
```

Les statuts `404`, `500` et `503` empruntent exactement la même branche
`!response.ok`. Tester chacun d’eux répéterait donc la même règle sans ajouter
de comportement couvert.

Le statut `503 Service Unavailable` sert de représentant réaliste d’une
indisponibilité temporaire du catalogue et justifie l’action « Réessayer ».

Des tests supplémentaires deviendraient utiles si le code distinguait
réellement les statuts :

```text
401 → demander une authentification
404 → afficher une ressource absente
503 → proposer une nouvelle tentative
```

## Pourquoi le Wi-Fi peut être coupé

En développement et dans les tests, MSW intercepte la requête localement :

```text
fetch('/api/products')
→ interception MSW
→ handler local
→ fixture locale
→ réponse simulée
```

La requête reste visible dans l’onglet Network parce qu’elle conserve la forme
d’une vraie requête HTTP du point de vue de l’application. Elle n’a cependant
pas besoin d’atteindre un serveur distant. Couper le Wi-Fi ne simule donc pas
une erreur tant que le handler MSW répond.

## `renderHook` et `result.current`

`renderHook` monte un composant de test interne qui exécute le hook :

```ts
const { result } = renderHook(() => useProducts())
```

`result` est un conteneur maintenu par React Testing Library. Sa propriété
`current` contient la valeur la plus récemment retournée par le hook :

```text
premier rendu  → result.current.status = loading
nouveau rendu  → result.current.status = success
```

Il ne faut pas capturer `current` trop tôt :

```ts
const { current } = result
```

Cette variable conserverait la valeur disponible au moment de la
déstructuration. Consulter `result.current` permet au contraire d’obtenir la
dernière valeur après chaque rendu.

## Fonctionnement de `waitFor`

`waitFor` n’attend pas un statut particulier. Il réexécute son callback jusqu’à
ce que celui-ci ne lance plus d’erreur, ou jusqu’au délai maximal.

```ts
await waitFor(() => {
  expect(result.current.status).toBe('empty')
})
```

Déroulement possible :

```text
status = loading
→ l’assertion échoue
→ waitFor intercepte l’échec

React met le hook à jour

status = empty
→ l’assertion réussit
→ waitFor se termine
```

Deux états contradictoires ne doivent pas être vérifiés dans le même callback :

```ts
await waitFor(() => {
  expect(result.current.status).toBe('loading')
  expect(result.current.status).toBe('empty')
})
```

Ils ne peuvent jamais être vrais simultanément. Pour tester une chronologie :

```ts
expect(result.current.status).toBe('loading')

await waitFor(() => {
  expect(result.current.status).toBe('empty')
})
```

## `toBe` et `toEqual`

`toBe` vérifie une primitive exacte ou l’identité d’une référence. Il convient
aux statuts, nombres et booléens :

```ts
expect(result.current.status).toBe('success')
```

`toEqual` compare récursivement la structure des objets et tableaux :

```ts
expect(result.current.products).toEqual(products)
```

Deux objets peuvent avoir le même contenu sans être la même instance :

```ts
expect({ name: 'Chair' }).toEqual({ name: 'Chair' }) // réussite
expect({ name: 'Chair' }).toBe({ name: 'Chair' }) // échec
```

Pour une chaîne, les deux matchers fonctionnent. `toBe` exprime simplement plus
précisément l’intention pour une valeur primitive.

## `act`

Lorsqu’un test appelle directement une fonction qui modifie l’état React, cette
action est enveloppée dans `act` :

```ts
act(() => {
  result.current.retry()
})
```

`act` :

1. exécute son callback une fois ;
2. laisse React traiter les mises à jour déclenchées ;
3. rend ces mises à jour observables avant l’assertion suivante.

Dans cet exemple, `retry` est appelé une seule fois. Cela ne signifie pas
nécessairement qu’un seul rendu React aura lieu : une action peut provoquer
plusieurs mises à jour ou effets.

```ts
act(() => {
  result.current.retry()
})

expect(result.current.status).toBe('loading')
```

Les interactions réalisées avec des outils comme `userEvent` sont
généralement déjà enveloppées de manière appropriée. L’appel direct d’une
fonction retournée par un hook doit être encadré explicitement.

## Réduction d’une union discriminée

Le type du hook est une union :

```ts
type ProductsState =
  | { status: 'loading' }
  | { status: 'success'; products: Product[] }
  | { status: 'empty' }
  | { status: 'error'; error: Error }
```

Avant de vérifier `status`, TypeScript ne peut pas garantir que `products` ou
`error` existe.

```ts
if (result.current.status === 'success') {
  expect(result.current.products).toEqual(products)
}
```

Le contrôle sur le discriminant réduit l’union au membre `success`. Dans ce
bloc, TypeScript sait donc que `products` est un `Product[]`.

Même principe pour l’erreur :

```ts
if (result.current.status === 'error') {
  expect(result.current.error.message).toContain('503')
}
```

Une variante plus explicite consiste à capturer un état stable puis à échouer
si son statut est inattendu :

```ts
const state = result.current

if (state.status !== 'success') {
  throw new Error(`Expected success, received ${state.status}`)
}

expect(state.products).toEqual(products)
```

## Scénarios couverts par le hook

| Scénario             | Handler MSW                                    | État final attendu                      |
| -------------------- | ---------------------------------------------- | --------------------------------------- |
| Chargement réussi    | Fixture `products`                             | `success` avec les produits             |
| Catalogue vide       | `HttpResponse.json([])`                        | `empty`                                 |
| Service indisponible | Réponse `503`                                  | `error` avec une `Error`                |
| Nouvelle tentative   | Premier appel `503`, second appel avec fixture | `error`, puis `loading`, puis `success` |

Cette couverture vérifie les comportements publics du hook sans tester ses
détails internes comme la valeur exacte de `requestId`.
