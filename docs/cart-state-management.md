# Gestion du panier avec React

## Sommaire

1. [Vue d’ensemble](#1-vue-densemble)
2. [Modèle métier](#2-modèle-métier)
3. [Reducer et actions](#3-reducer-et-actions)
4. [Immutabilité et références](#4-immutabilité-et-références)
5. [Selectors et source de vérité](#5-selectors-et-source-de-vérité)
6. [Context API et hook `useCart`](#6-context-api-et-hook-usecart)
7. [Provider et `useReducer`](#7-provider-et-usereducer)
8. [Persistance dans `localStorage`](#8-persistance-dans-localstorage)
9. [Validation des données persistées](#9-validation-des-données-persistées)
10. [Tests et mocks](#10-tests-et-mocks)
11. [Flux utilisateur complet](#11-flux-utilisateur-complet)
12. [Limites et décisions](#12-limites-et-décisions)

---

## 1. Vue d’ensemble

Le panier est divisé en plusieurs responsabilités :

| Élément        | Responsabilité                                                          |
| -------------- | ----------------------------------------------------------------------- |
| `cartReducer`  | Calculer le prochain état à partir de l’état courant et d’une action    |
| Selectors      | Calculer les valeurs dérivées du panier                                 |
| `CartProvider` | Initialiser l’état, exécuter le reducer et exposer les commandes métier |
| `CartContext`  | Transporter la valeur construite par le Provider                        |
| `useCart`      | Permettre aux composants de consommer le Context de manière sécurisée   |
| `cart-storage` | Charger, valider et sauvegarder l’état persistant                       |

```text
Interface utilisateur
        ↓
     useCart()
        ↓
commande : addItem(product)
        ↓
dispatch({ type: "add-item", payload: product })
        ↓
   cartReducer
        ↓
nouveau CartState
        ↓
nouveau rendu des consommateurs concernés
        ↓
sauvegarde dans localStorage
```

Le contexte transporte la valeur construite par le Provider.

---

## 2. Modèle métier

```ts
type CartLine = {
  id: string
  name: string
  imageUrl: string
  priceInCents: number
  quantity: number
}

type CartState = {
  lines: readonly CartLine[]
}
```

Le prix est stocké en centimes afin d’éviter les problèmes liés aux nombres décimaux en JavaScript :

```ts
0.1 + 0.2 // 0.30000000000000004
```

Avec des centimes :

```ts
10 + 20 // 30
```

### Que protège `readonly` ?

Dans :

```ts
lines: readonly CartLine[]
```

`readonly` interdit les opérations qui modifieraient directement le tableau :

```ts
state.lines.push(line) // interdit
state.lines.splice(0, 1) // interdit
state.lines[0] = line // interdit
```

Cependant, le tableau contient des références vers des objets `CartLine`.

Cette définition n’interdit donc pas nécessairement :

```ts
state.lines[0].quantity += 1
```

Le tableau n’a pas été modifié : il contient toujours la même référence. C’est l’objet situé derrière cette référence qui a été modifié.

Pour protéger également chaque ligne au niveau du typage, on pourrait écrire :

```ts
type CartState = {
  lines: readonly Readonly<CartLine>[]
}
```

Cela reste une protection TypeScript appliquée pendant le développement. Elle n’empêche pas physiquement une mutation lorsque le JavaScript s’exécute.

---

## 3. Reducer et actions

Un reducer est une fonction pure :

```ts
;(previousState, action) => nextState
```

Il reçoit :

- l’état courant ;
- une action décrivant un événement.

Il retourne :

- soit un nouvel état ;
- soit l’état existant si rien ne doit changer.

Un reducer ne doit pas :

- modifier l’état reçu ;
- accéder au DOM ;
- écrire dans `localStorage` ;
- effectuer une requête HTTP ;
- dépendre d’une valeur aléatoire ou imprévisible.

Les actions du panier représentent des événements métier :

```text
add-item
remove-item
increase-quantity
decrease-quantity
```

Une action décrit ce qui s’est produit :

```ts
{
  type: 'increase-quantity',
  payload: {
    id: 'product-1',
  },
}
```

Le reducer détermine comment cet événement transforme l’état.

### Démarche TDD (Test-Driven Development)

La démarche utilisée sur le reducer est la suivante :

1. Définir le contrat TypeScript.
2. Ajouter une implémentation minimale et type-correcte.
3. Écrire le test du comportement attendu.
4. Vérifier que le test échoue pour la bonne raison.
5. Implémenter la règle métier.
6. Vérifier que le test passe.
7. Refactorer sans modifier le comportement.

Le passage volontaire au rouge confirme que le test est réellement capable de détecter l’absence ou l’erreur d’implémentation.

```text
RED
Le test échoue pour la raison attendue
        ↓
GREEN
L’implémentation minimale fait passer le test
        ↓
REFACTOR
Le code est amélioré sans casser le comportement
```

---

## 4. Immutabilité et références

### Mutation

```ts
line.quantity += 1
```

Cette instruction modifie directement l’objet existant en mémoire.

Toutes les parties de l’application qui possèdent une référence vers cet objet voient alors la modification.

```text
state.lines[0] ────────┐
                       ├──→ même objet CartLine
anotherReference ──────┘
```

### Mise à jour immuable

```ts
return {
  ...line,
  quantity: line.quantity + 1,
}
```

Cette expression :

1. crée un nouvel objet ;
2. copie les propriétés de `line` dans ce nouvel objet ;
3. remplace la valeur de `quantity` dans la copie ;
4. laisse l’objet original intact.

```text
Avant
oldState.lines ───→ line A { quantity: 1 }

Après
oldState.lines ───→ line A { quantity: 1 }
newState.lines ───→ line B { quantity: 2 }
```

L’objet retourné est anonyme au sens où aucune variable intermédiaire ne lui est attribuée :

```ts
const updatedLine = {
  ...line,
  quantity: line.quantity + 1,
}
```

Cette variable n’est toutefois pas nécessaire. L’objet existe bien en mémoire et sa référence est immédiatement retournée par la fonction.

### Structural sharing

Le **structural sharing**, ou partage structurel, consiste à créer uniquement de nouvelles références pour les parties réellement modifiées.

Imaginons trois lignes :

```text
line A
line B
line C
```

Si seule `line B` change, il n’est pas nécessaire de recréer `line A` et `line C` :

```text
Ancien état
├── line A ─────────────┐
├── line B              │
└── line C ──────────┐  │
                     │  │
Nouvel état          │  │
├── line A ──────────┘  │ même référence
├── new line B           │ nouvelle référence
└── line C ──────────────┘ même référence
```

Le nouvel état partage donc une partie de sa structure avec l’ancien état.

Cela permet :

- de limiter les allocations inutiles ;
- de conserver les références des objets non modifiés ;
- de détecter plus facilement les changements par comparaison de références ;
- d’aider React, Redux et les outils de mémoïsation à identifier les parties modifiées.

### Objets imbriqués

Le spread copie uniquement le premier niveau d’un objet :

```ts
const copy = {
  ...product,
}
```

Avec :

```ts
const product = {
  id: 'product-1',
  details: {
    color: 'black',
  },
}
```

`product` et `copy` sont deux objets différents, mais leur propriété `details` pointe vers le même objet :

```text
product ──→ objet A
              │
              └── details ──→ objet C

copy ─────→ objet B
              │
              └── details ──→ objet C
```

Cette modification toucherait donc aussi l’objet original :

```ts
copy.details.color = 'white'
```

Pour modifier `details` de manière immuable, il faut copier le niveau concerné :

```ts
const copy = {
  ...product,
  details: {
    ...product.details,
    color: 'white',
  },
}
```

Un clone récursif systématique de tout l’état n’est pas souhaitable :

- il recrée des objets qui n’ont pas changé ;
- il supprime le partage structurel ;
- il consomme davantage de mémoire et de temps ;
- il rend toutes les références différentes, même lorsque leurs données sont identiques.

La bonne stratégie consiste à copier uniquement le chemin qui mène à la valeur modifiée.

---

## 5. Selectors et source de vérité

Les selectors sont des fonctions pures qui calculent des valeurs à partir de l’état :

```ts
getCartItemCount(state)
getCartTotalInCents(state)
```

Ces valeurs sont dérivées de `state.lines` :

```text
state.lines
├──→ getCartItemCount()
│        └──→ itemCount
│
└──→ getCartTotalInCents()
         └──→ totalInCents
```

Elles ne sont donc pas enregistrées séparément dans `CartState`.

### Pourquoi conserver une seule source de vérité ?

Si `lines`, `itemCount` et `totalInCents` étaient tous enregistrés indépendamment, chaque action devrait mettre à jour les trois valeurs de manière parfaitement synchronisée.

Une erreur pourrait produire :

```ts
const state = {
  lines: [
    {
      quantity: 2,
      priceInCents: 800,
    },
  ],
  itemCount: 1,
  totalInCents: 800,
}
```

Les lignes indiquent deux articles pour un total de 1 600 centimes, alors que les autres propriétés indiquent un article pour 800 centimes.

Différents consommateurs pourraient alors afficher des informations contradictoires :

```text
Badge du header       → 1 article
Page panier           → 2 articles
Total affiché         → 8 €
Total recalculé       → 16 €
```

En conservant uniquement `lines` comme source de vérité, les autres valeurs sont toujours recalculées à partir des mêmes données :

```text
Une seule donnée stockée
        ↓
plusieurs représentations dérivées cohérentes
```

---

## 6. Context API et hook `useCart`

Le Context est créé au niveau du module :

```ts
export const CartContext = createContext<CartContextValue | null>(null)
```

### Pourquoi le créer au niveau du module ?

Cette instruction est placée en dehors d’un composant afin qu’elle ne soit exécutée qu’une seule fois lors du chargement du module.

Le Provider et les consommateurs doivent utiliser exactement le même objet Context :

```text
CartContext
├── utilisé par le Provider
└── utilisé par useContext
```

Si `createContext()` était appelé à chaque rendu du Provider, un nouvel objet Context serait créé :

```text
Premier rendu  → Context A
Deuxième rendu → Context B
```

Des consommateurs associés à `Context A` ne pourraient pas lire une valeur fournie par `Context B`.

La création au niveau du module garantit donc une identité stable et partagée.

### Pourquoi `null` ?

```ts
createContext<CartContextValue | null>(null)
```

La valeur `null` représente l’absence de Provider au-dessus du consommateur.

Le hook personnalisé peut ainsi détecter une mauvaise utilisation :

```ts
export function useCart() {
  const context = useContext(CartContext)

  if (context === null) {
    throw new Error('useCart must be used within CartProvider')
  }

  return context
}
```

### Les deux rôles de `useCart`

`useCart` possède deux responsabilités complémentaires.

#### Fournir une API simple aux consommateurs

Un composant utilise :

```ts
const { lines, itemCount, addItem } = useCart()
```

Il n’a pas besoin :

- d’importer directement `CartContext` ;
- d’appeler lui-même `useContext` ;
- de gérer la possibilité d’obtenir `null`.

#### Sécuriser l’utilisation du Context

Si le composant est rendu en dehors de `CartProvider`, le hook produit immédiatement une erreur explicite :

```text
useCart must be used within CartProvider
```

Sans cette vérification, l’erreur apparaîtrait potentiellement plus tard lors de l’accès à une propriété inexistante.

### Un custom hook peut retourner différentes formes

Un custom hook n’est pas obligé de retourner un tuple comme `useState`.

Un **tuple** est un tableau dont :

- le nombre d’éléments est connu ;
- la position et le type de chaque élément sont connus.

Par exemple :

```ts
const [state, setState] = useState()
```

peut être représenté conceptuellement comme :

```ts
;[State, Dispatch]
```

Un custom hook peut retourner :

- un tuple ;
- un objet ;
- une valeur ;
- une fonction ;
- ou toute autre structure adaptée à son API.

`useCart` retourne un objet, car plusieurs données et commandes nommées doivent être exposées.

### Props drilling

Le Context évite le **props drilling** lorsqu’une donnée doit traverser plusieurs composants intermédiaires qui n’en ont pas besoin :

```text
App
└── Layout
    └── Header
        └── CartButton
```

Sans Context, `itemCount` devrait potentiellement traverser `App`, `Layout` et `Header`, même si seul `CartButton` l’utilise.

---

## 7. Provider et `useReducer`

Le Provider initialise l’état avec :

```ts
const [state, dispatch] = useReducer(cartReducer, storage, loadCartState)
```

Les trois arguments ont des rôles distincts :

| Argument        | Rôle                                                |
| --------------- | --------------------------------------------------- |
| `cartReducer`   | Décrire comment calculer les prochains états        |
| `storage`       | Fournir la donnée transmise à l’initialisateur      |
| `loadCartState` | Construire le premier état à partir de cette donnée |

### Évaluation des arguments en JavaScript

Avant d’appeler une fonction, JavaScript évalue les expressions utilisées comme arguments.

Dans :

```ts
useReducer(cartReducer, storage, loadCartState)
```

JavaScript évalue successivement :

```text
cartReducer   → référence vers la fonction reducer
storage       → référence vers l’objet Storage
loadCartState → référence vers la fonction d’initialisation
```

Il appelle ensuite `useReducer` avec ces trois valeurs.

Important : écrire `loadCartState` transmet la fonction sans l’exécuter.

```ts
loadCartState // référence vers la fonction
```

Alors que :

```ts
loadCartState(storage) // exécution immédiate de la fonction
```

Dans notre cas, c’est React qui appellera l’initialisateur avec `storage` :

```text
useReducer reçoit
├── reducer
├── storage
└── init
       ↓
React exécute init(storage)
       ↓
premier CartState
```

### Premier montage

```text
storage
   ↓
loadCartState(storage)
   ↓
premier CartState
   ↓
premier rendu
```

### Actions suivantes

Après l’initialisation, `loadCartState` n’est pas rappelé pour chaque action.

```text
état courant + action
        ↓
cartReducer
        ↓
prochain état
        ↓
nouveau rendu
```

Le deuxième argument, `storage`, n’est donc pas directement l’état initial. Il s’agit de `initialArg`, la donnée transmise au troisième argument.

### Commandes métier

Le Provider transforme `dispatch` en commandes explicites :

```ts
addItem(product)
removeItem(id)
increaseQuantity(id)
decreaseQuantity(id)
```

Par exemple :

```ts
addItem: (product) => {
  dispatch({
    type: 'add-item',
    payload: product,
  })
}
```

Les composants consommateurs n’ont donc pas besoin de connaître :

- le nom exact des actions ;
- la forme du payload ;
- le fonctionnement interne du reducer.

```text
Composant
→ addItem(product)

Provider
→ transforme la commande en action

Reducer
→ transforme l’état
```

---

## 8. Persistance dans `localStorage`

La persistance est un **effet secondaire**, ou **side effect** en anglais.

Un effet secondaire est une opération qui interagit avec quelque chose situé en dehors du calcul pur du rendu ou du reducer :

- écrire dans `localStorage` ;
- effectuer une requête réseau ;
- modifier le titre du document ;
- démarrer un timer ;
- ajouter un event listener.

La sauvegarde est réalisée avec :

```ts
useEffect(() => {
  saveCartState(storage, state)
}, [storage, state])
```

### Pourquoi ne pas sauvegarder dans le reducer ?

Le reducer doit rester une fonction pure :

```text
mêmes entrées
→ même sortie
→ aucune modification extérieure
```

`localStorage.setItem()` modifie un système extérieur au reducer. Cette opération appartient donc à un effet.

### Render phase et commit phase

React travaille schématiquement en deux grandes phases :

```text
1. Render phase
   React appelle les composants
   React calcule le prochain arbre d’interface
   React compare les résultats
            ↓
2. Commit phase
   React applique les changements au DOM
   L’interface validée devient visible
            ↓
3. Effects
   React exécute les useEffect concernés
```

Pour le panier :

```text
dispatch(action)
        ↓
cartReducer
        ↓
nouvel état
        ↓
render phase
React calcule CartSummary
        ↓
commit phase
React met à jour le DOM
        ↓
useEffect
saveCartState(storage, state)
```

Le **commit React** désigne donc le moment où React applique effectivement au DOM les modifications qu’il a calculées.

L’effet de sauvegarde intervient après ce commit.

### Sérialisation

`localStorage` ne stocke que des chaînes de caractères :

```text
CartState
   ↓ JSON.stringify
chaîne JSON
   ↓ localStorage.setItem
stockage du navigateur
```

Au chargement :

```text
localStorage.getItem
   ↓
string | null
   ↓ JSON.parse
unknown
   ↓ validation
CartState ou état vide
```

---

## 9. Validation des données persistées

Le résultat de `JSON.parse()` doit être traité comme une donnée externe non fiable.

Même si le contenu vient de notre propre application, il peut être :

- ancien ;
- modifié manuellement ;
- incomplet ;
- corrompu ;
- incompatible avec une nouvelle version du modèle.

Il est donc considéré comme `unknown`.

### Type guard

Un type guard vérifie la structure d’une valeur à l’exécution et permet à TypeScript de réduire son type :

```ts
function isCartLine(value: unknown): value is CartLine
```

Après :

```ts
if (isCartLine(value)) {
  // value est maintenant considéré comme CartLine
}
```

### Exprimer une validité

Pour qu’une ligne soit valide, toutes les conditions doivent être vraies :

```ts
return (
  typeof value.id === 'string' &&
  typeof value.name === 'string' &&
  typeof value.quantity === 'number'
)
```

### Détecter une invalidité

Pour détecter une valeur invalide, une seule condition incorrecte suffit :

```ts
if (
  typeof value.id !== 'string' ||
  typeof value.name !== 'string' ||
  typeof value.quantity !== 'number'
) {
  return false
}
```

### Lois de De Morgan

Les lois de De Morgan expliquent comment transformer une négation appliquée à un groupe de conditions.

En logique booléenne :

```text
NOT (A AND B)
équivaut à
(NOT A) OR (NOT B)
```

Et :

```text
NOT (A OR B)
équivaut à
(NOT A) AND (NOT B)
```

Dans notre validation :

```text
La ligne est valide
si A ET B ET C sont vrais.
```

Son contraire devient :

```text
La ligne est invalide
si NON A OU NON B OU NON C.
```

C’est pourquoi :

```ts
typeof value.id === 'string' && typeof value.name === 'string'
```

devient, lorsqu’on cherche l’invalidité :

```ts
typeof value.id !== 'string' || typeof value.name !== 'string'
```

Ressources complémentaires :

- [Lois de De Morgan — Unisciel](https://uel.unisciel.fr/mathematiques/logique1/logique1_ch01/co/apprendre_ch1_04.html)
- [Opérateurs logiques JavaScript — MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Guide/Expressions_and_operators)

Une donnée absente, corrompue ou incompatible ne doit pas faire planter l’application. Le panier revient alors à son état vide.

---

## 10. Tests et mocks

### Mock de fonction avec Vitest

```ts
const storage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
}
```

`vi.fn()` crée une fonction espionne.

Lorsqu’elle est transmise à l’implémentation, Vitest n’effectue aucune liaison magique. Le code testé appelle exactement la référence de fonction contenue dans l’objet :

```text
test
└── crée storage.getItem avec vi.fn()
          ↓
loadCartState(storage)
          ↓
appelle storage.getItem(...)
          ↓
la même fonction vi.fn() reçoit l’appel
          ↓
Vitest enregistre les arguments
```

Les appels sont disponibles dans :

```ts
storage.getItem.mock.calls
storage.setItem.mock.calls
```

Chaque entrée représente un appel :

```ts
storage.setItem.mock.calls[0]
```

Elle contient les arguments de ce premier appel :

```ts
;['react-reboot-cart', '{"version":1,"lines":[]}']
```

### Valeur retournée par un mock

Un mock peut être configuré pour retourner une valeur :

```ts
storage.getItem.mockReturnValue(null)
```

ou :

```ts
storage.getItem.mockReturnValue(JSON.stringify(storedCart))
```

Le code testé reçoit alors cette valeur comme s’il appelait le véritable `localStorage`.

### `renderHook`

```ts
const { result } = renderHook(() => useCart(), {
  wrapper: TestProviders,
})
```

`renderHook` attend une fonction qu’il pourra appeler à l’intérieur du cycle de rendu React.

Cette callback :

```ts
;() => useCart()
```

ne signifie pas seulement « déclencher le hook ». Elle retourne la valeur produite par `useCart`.

`renderHook` conserve cette valeur dans :

```ts
result.current
```

Ceci serait incorrect :

```ts
renderHook(useCart())
```

`useCart()` serait exécuté immédiatement, avant que `renderHook` ait créé son environnement React. Cela violerait les Rules of Hooks.

### Wrapper de test

```tsx
function TestProviders({ children }) {
  return <CartProvider storage={testStorage}>{children}</CartProvider>
}
```

Le wrapper reproduit l’environnement nécessaire aux composants et hooks testés.

```text
TestProviders
└── CartProvider
    └── composant ou hook testé
```

Cela évite de répéter le Provider dans chaque test.

### `result` et `result.current`

`result` est un conteneur fourni par React Testing Library.

```ts
const { result } = renderHook(...)
```

La dernière valeur retournée par le hook se trouve dans :

```ts
result.current
```

Lorsqu’un re-render du hook se produit, React Testing Library met à jour `result.current`.

### `act`

`act()` regroupe une opération susceptible de provoquer une mise à jour React :

```ts
act(() => {
  result.current.addItem(product)
})
```

Il indique au test :

> Exécute cette interaction, puis laisse React traiter toutes les mises à jour synchrones associées avant de poursuivre les assertions.

`act()` n’exécute pas automatiquement une commande plusieurs fois. La fonction placée dans sa callback est appelée selon ce qui est écrit dans cette callback.

### Isolation des tests

Les mocks et le stockage doivent être réinitialisés entre les tests :

```ts
beforeEach(() => {
  window.localStorage.clear()
})
```

ou :

```ts
mockFunction.mockClear()
```

`mockClear()` efface l’historique des appels, mais conserve l’implémentation configurée du mock.

L’objectif est qu’un test ne dépende jamais de l’état laissé par un test précédent.

---

## 11. Flux utilisateur complet

### Ajouter un produit

```text
Clic sur “Add to cart”
        ↓
AddToCartButton
        ↓
useCart().addItem(product)
        ↓
CartProvider
        ↓
dispatch({
  type: "add-item",
  payload: product
})
        ↓
cartReducer
        ↓
nouveau CartState
        ↓
CartSummary se met à jour
        ↓
useEffect sauvegarde le panier
```

### Modifier une ligne

```text
Bouton +
→ increaseQuantity(id)
→ dispatch(increase-quantity)
→ reducer
→ nouvelle quantité
```

```text
Bouton −
→ decreaseQuantity(id)
→ dispatch(decrease-quantity)
→ reducer
→ quantité diminuée ou ligne supprimée
```

```text
Bouton supprimer
→ removeItem(id)
→ dispatch(remove-item)
→ reducer
→ ligne supprimée
```

Les tests de composants vérifient ces comportements visibles sans dépendre directement de la structure interne du reducer.

---

## 12. Limites et décisions

Cette implémentation est volontairement adaptée au React Reboot :

- le panier reste local au navigateur ;
- les prix ne sont pas revalidés par un serveur ;
- le stock n’est pas recalculé ;
- aucune authentification ne permet de retrouver le panier sur un autre appareil ;
- aucun checkout réel n’est implémenté.

Dans un e-commerce complet, le backend doit rester l’autorité sur :

- les prix ;
- les promotions ;
- les périodes commerciales ;
- les stocks ;
- les variantes ;
- les codes promotionnels ;
- la validation finale de la commande.

La future migration vers Redux Toolkit remplacera la source de vérité actuelle du panier.

Context avec `useReducer` et Redux Toolkit ne devront pas gérer simultanément le même état métier, car cela créerait deux sources de vérité concurrentes.
