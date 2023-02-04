```json conversation-template
{
  "id": "chat-french",
  "engineVersion": 0,
  "type": "basic-chat",
  "label": "Commencer une discussion",
  "description": "Commencer une discussion avec Rubberduck.",
  "icon": {
    "type": "codicon",
    "value": "comment-unresolved"
  },
  "prompt": {
    "template": {
      "type": "sections",
      "sections": [
        {
          "type": "lines",
          "title": "Instructions",
          "lines": [
            "Continue la conversation ci-dessous.",
            "Fais particulièrement attention aux requêtes en cours du développeur."
          ]
        },
        {
          "type": "lines",
          "title": "Requête en cours",
          "lines": ["Développeur: ${lastMessage}"]
        },
        {
          "type": "optional-selected-code",
          "title": "Code Sélectionné"
        },
        {
          "type": "conversation",
          "roles": {
            "bot": "Robot",
            "user": "Développeur"
          }
        },
        {
          "type": "lines",
          "title": "Tâche",
          "lines": [
            "Écris une réponse qui poursuit la conversation.",
            "Fais particulièrement attention à la requête en cours du développeur.",
            "Considère la possibilité qu’il n’y ait pas de solution possible.",
            "Demande des clarifications si le message n’a pas de sens ou que plus de données sont nécessaires pour répondre.",
            "N’inclus aucun lien.",
            "Inclus des snippets de code (en Markdown) et des exemples lorsque c’est approprié."
          ]
        },
        {
          "type": "lines",
          "title": "Réponse",
          "lines": ["Robot:"]
        }
      ]
    },
    "maxTokens": 1024,
    "stop": ["Robot:", "Développeur:"]
  }
}
```
