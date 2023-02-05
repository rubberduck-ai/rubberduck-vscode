# AI Chat in French

This templates lets you chat with Rubberduck in French.

## Conversation Template

### Configuration

```json conversation-template
{
  "id": "chat-fr",
  "engineVersion": 0,
  "type": "basic-chat",
  "label": "Commencer une discussion",
  "description": "Commencer une discussion avec Rubberduck.",
  "icon": {
    "type": "codicon",
    "value": "comment-discussion"
  },
  "prompt": {
    "template": "chat",
    "maxTokens": 1024,
    "stop": ["Robot:", "Développeur:"]
  }
}
```

### Chat Prompt Template

```template-chat
## Instructions
Continue la conversation ci-dessous.
Fais particulièrement attention aux requêtes en cours du développeur.

## Requête en cours
Développeur: {{lastMessage}}

{{#if selectedText}}
## Code Sélectionné
\`\`\`
{{selectedText}}
\`\`\`
{{/if}}

## Conversation
{{#each messages}}
{{#if (eq author "bot")}}
Robot: {{content}}
{{else}}
Développeur: {{content}}
{{/if}}
{{/each}}

## Tâche
Écris une réponse qui poursuit la conversation.
Fais particulièrement attention à la requête en cours du développeur.
Considère la possibilité qu’il n’y ait pas de solution possible.
Demande des clarifications si le message n’a pas de sens ou que plus de données sont nécessaires pour répondre.
N’inclus aucun lien.
Inclus des snippets de code (en Markdown) et des exemples lorsque c’est approprié.

## Réponse
Robot:
```
