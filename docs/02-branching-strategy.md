# Stratégie de branches

## Les deux branches principales

```
main      ──●──●──●──●──   version "starter" : setup + énoncés, code à trous
              \
complete       ●──●──●──   version "solution" : tout est implémenté
```

| Branche | Rôle | Public |
|---|---|---|
| `main` | Point de départ du workshop. Contient : le setup complet (dépendances, config, structure des dossiers), les README d'exercices, les squelettes de code avec des `// TODO`. Tout compile et tourne, mais les fonctionnalités agent sont à implémenter. | Participants (clone au début du workshop) |
| `complete` | Référence complète. Chaque exercice résolu, code propre et commenté. | Participants (après le workshop, ou en cas de blocage) |

## Règles de travail

1. **Développer d'abord sur `complete`** : implémenter la version finale d'un module.
2. **Puis "dériver" la version starter sur `main`** : reprendre le code de `complete` et retirer les parties à faire soi-même (remplacées par des `TODO` + indices).
3. Les changements communs (docs, setup, dépendances, UI partagée) se font sur `main` puis sont mergés dans `complete` (`main` → `complete`, jamais l'inverse).

## Option à considérer plus tard

Si la granularité est utile : des tags ou branches par étape (`checkpoint/03-tools`) pour permettre à un participant perdu de repartir d'un état intermédiaire. À décider quand le contenu sera stabilisé — voir [05-open-questions.md](05-open-questions.md).
