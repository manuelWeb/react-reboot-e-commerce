# Notes sur `fetch` et `useProducts`

## Responsabilités

Le chargement du catalogue est réparti entre plusieurs couches :

| Élément         | Responsabilité                                                                          |
| --------------- | --------------------------------------------------------------------------------------- |
| `fetchProducts` | Effectuer la requête HTTP et transformer une réponse non valide en erreur               |
| `useProducts`   | Gérer le cycle React : chargement, succès, catalogue vide, erreur et nouvelle tentative |
| Composant       | Afficher l’état exposé par le hook et transmettre les actions de l’utilisateur          |
| MSW             | Simuler l’API pendant le développement et les tests                                     |

Le code applicatif utilise un appel HTTP standard et ne dépend pas directement
de MSW :

```text
Composant → useProducts → fetchProducts → fetch('/api/products')
```

## `fetch` et son second paramètre

La signature simplifiée de `fetch` est :

```ts
fetch(input, init?)
```

- `input` désigne la ressource, par exemple `/api/products` ;
- `init` est un objet `RequestInit` optionnel qui configure notamment la
  méthode, les en-têtes, le corps, les credentials et le signal d’annulation.

Dans le projet :

```ts
fetch('/api/products', { signal })
```

Le second paramètre permet donc de rattacher la requête à un
`AbortController`.

### `response.ok`

`fetch` ne rejette pas automatiquement sa promesse pour une réponse HTTP
`404`, `500` ou `503`. Une réponse HTTP a bien été reçue : il faut examiner son
statut.

```ts
if (!response.ok) {
  throw new Error(
    `Failed to fetch products: ${response.status} ${response.statusText}`,
  )
}
```

`response.ok` vaut `true` pour les statuts compris entre `200` et `299`. Il vaut
`false` pour les autres statuts.

En revanche, `fetch` rejette sa promesse lorsque la requête elle-même ne peut
pas aboutir, par exemple à cause d’une erreur réseau ou d’une annulation.

### Lecture du corps

`response.body` est un `ReadableStream`, pas directement le contenu JSON. Le
flux doit être lu et décodé :

```ts
const data = await response.json()
```

Le corps est normalement consommable une seule fois. Après `response.json()`,
`response.text()` ne peut pas relire le même flux. Pour plusieurs lectures
exceptionnelles, il faut cloner la réponse avant sa consommation :

```ts
const copy = response.clone()
```

## Cycle asynchrone de `useProducts`

Le hook représente explicitement les étapes du chargement :

```text
montage
  ↓
loading
  ↓
requête HTTP
  ├── produits → success
  ├── []       → empty
  ├── erreur   → error
  └── abandon  → aucune erreur utilisateur
```

Une requête HTTP synchronise le composant avec un système externe à React.
`useEffect` est donc approprié.

## Pourquoi le callback de l’effet n’est pas `async`

Une fonction `async` retourne toujours une `Promise`, même lorsqu’elle ne
retourne explicitement aucune valeur.

Or React attend qu’un effet retourne :

- soit rien ;
- soit une fonction de nettoyage.

```ts
useEffect(() => {
  return () => {
    // nettoyage
  }
}, [])
```

Ce code ne respecte donc pas le contrat :

```ts
useEffect(async () => {
  // Une Promise est retournée à React.
}, [])
```

React n’attend pas cette promesse et ne peut pas l’utiliser comme fonction de
nettoyage. Le pattern correct consiste à définir une fonction asynchrone à
l’intérieur de l’effet, puis à l’appeler :

```ts
useEffect(() => {
  async function loadProducts() {
    // await fetchProducts(...)
  }

  void loadProducts()
}, [])
```

### Pourquoi `void loadProducts()` ?

`loadProducts()` retourne une `Promise<void>`. L’opérateur `void` indique que
la promesse est volontairement lancée sans que sa valeur de retour soit
attendue à cet endroit :

```ts
void loadProducts()
```

Cela exprime une opération « fire and forget » et évite que certains linters
considèrent la promesse comme oubliée. `void` ne capture toutefois aucune
erreur. La fonction asynchrone doit donc gérer ses rejets avec `try/catch`.

## `AbortController` et `AbortSignal`

Un contrôleur est créé pour chaque exécution de l’effet :

```ts
const controller = new AbortController()
```

Il joue le rôle de télécommande :

```text
AbortController
├── signal : état observable de l’annulation
└── abort() : déclenche l’annulation
```

Le signal est transmis à la requête :

```ts
fetchProducts(controller.signal)
```

Il expose notamment :

- `signal.aborted`, qui indique si l’annulation a eu lieu ;
- `signal.reason`, qui peut indiquer sa raison ;
- un événement `abort`.

Le hook conserve le contrôleur, car il doit pouvoir annuler. La fonction
`fetchProducts` reçoit uniquement le signal, car elle doit seulement observer
cette décision.

Le nettoyage de l’effet déclenche l’annulation :

```ts
return () => {
  controller.abort()
}
```

Cela intervient lorsque le composant est démonté ou avant qu’une nouvelle
exécution du même effet remplace la précédente.

## `DOMException` et `AbortError`

Une requête `fetch` annulée est généralement rejetée avec une `DOMException`
dont le nom vaut `AbortError`.

```ts
if (error instanceof DOMException && error.name === 'AbortError') {
  return
}
```

`AbortError` n’est pas une classe comme `AbortController` ou `AbortSignal`.
C’est le nom conventionnel de cette exception. Les deux conditions vérifient
donc :

1. qu’il s’agit d’une exception issue d’une API Web ;
2. qu’il s’agit précisément d’une annulation.

Une annulation volontaire n’est pas une erreur métier à afficher à
l’utilisateur. Le `return` quitte alors uniquement la fonction asynchrone
`loadProducts`.

### Ce que ce `return` retourne réellement

`loadProducts` ne déclare aucune valeur de retour. Comme elle est `async`, son
retour est une `Promise<void>`. Dans le cas d’une annulation, `return` termine
donc cette promesse sans valeur et empêche l’exécution du `setState` d’erreur.

Il faut distinguer trois niveaux :

```text
useProducts()
└── callback de useEffect
    └── loadProducts()
        └── catch → return
```

Ce `return` :

- ne retourne pas depuis `useEffect` ;
- ne retourne pas depuis `useProducts` ;
- ne modifie pas le contrat public du hook.

Après le rendu courant, `useProducts` retourne toujours :

```ts
return {
  ...state,
  retry,
}
```

Autrement dit, le composant reçoit toujours le dernier `ProductsState` connu
et la fonction `retry`. Le `return` interne sert seulement à interrompre le
traitement de la requête annulée.

## Pourquoi l’erreur du `catch` est `unknown`

JavaScript autorise le lancement de n’importe quelle valeur :

```ts
throw new Error('Failure')
throw 'Failure'
throw 42
throw null
throw { message: 'Failure' }
```

TypeScript ne peut donc pas considérer automatiquement que la valeur reçue par
`catch` est une instance de `Error`.

Le hook normalise cette valeur pour respecter son contrat :

```ts
const normalizedError =
  error instanceof Error
    ? error
    : new Error('useProducts: An unknown error occurred')
```

Ainsi, la branche `error` transporte toujours une véritable instance de
`Error`.

## Union discriminée `ProductsState`

```ts
type ProductsState =
  | { status: 'loading' }
  | { status: 'success'; products: Product[] }
  | { status: 'empty' }
  | { status: 'error'; error: Error }
```

`status` est le discriminant. Sa valeur permet à TypeScript de déterminer le
membre exact de l’union :

```ts
if (state.status === 'success') {
  state.products // Product[]
}
```

Avant ce contrôle, `products` n’est pas accessible, car cette propriété
n’existe pas dans tous les états.

L’état `empty` ne transporte pas `products: []`, `null` ou `undefined`, car son
statut contient déjà toute l’information nécessaire. Cela évite des propriétés
redondantes et des combinaisons incohérentes.

```text
loading → aucune donnée utilisable
success → un catalogue non vide
empty   → aucun produit
error   → une erreur
```

## Nouvelle tentative avec `requestId`

`requestId` représente une version locale de la requête, pas un identifiant
provenant du serveur.

```ts
const [requestId, setRequestId] = useState(0)
```

L’effet s’exécute une première fois au montage avec la valeur `0`. Une nouvelle
tentative incrémente cette valeur :

```ts
const retry = () => {
  setState({ status: 'loading' })
  setRequestId((current) => current + 1)
}
```

Comme `requestId` figure dans les dépendances, sa modification provoque :

```text
nettoyage de l’ancien effet
→ annulation éventuelle
→ nouvelle exécution de l’effet
→ nouvelle requête
```

## `StrictMode` et les deux requêtes en développement

En développement, React `StrictMode` effectue volontairement un cycle
supplémentaire :

```text
montage
→ effet et requête 1
→ nettoyage et annulation de la requête 1
→ nouveau montage simulé
→ effet et requête 2
→ réponse 200
```

Dans l’onglet Network, il est donc normal d’observer une première requête
annulée et une deuxième requête réussie. Ce comportement vérifie que les effets
supportent correctement leur nettoyage. Il n’est pas reproduit ainsi dans le
build de production.

## Sérialisation de `retry`

`JSON.stringify` ignore les fonctions. La fonction `retry` existe donc dans le
résultat du hook, même si elle n’apparaît pas dans le JSON affiché.

```tsx
const { retry, ...serializableState } = useProducts()

return (
  <>
    <pre>{JSON.stringify(serializableState, null, 2)}</pre>
    <button type="button" onClick={retry}>
      Réessayer
    </button>
  </>
)
```

## Référence rapide

```text
montage
→ loading
→ création du contrôleur
→ fetch avec signal
→ success / empty / error
→ nettoyage avec abort
→ retry
→ nouvelle requête
```

Les mécanismes de test associés sont détaillés dans
[`fetch-spec-notes.md`](./fetch-spec-notes.md).
