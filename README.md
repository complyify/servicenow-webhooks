# ServiceNow Webhooks Integration

## Introduction

Sample Node/ExpressJS application intended to demonstrate spawning companion incidents in remote ServiceNow applications from [Complyify|www.complyify.com] webhooks.

The ServiceNow integration is meant to be used for demonstration only. Customization is highly recommended.

Complyify webhooks currently support both JSON and x-www-form-urlencoded content types

## Requirements

1. An active ServiceNow application with a publically-accessible domain accepting TLS
connections with a publicly-trusted certificate.

2. A valid ServiceNow username/password combination

3. [RECOMMENDED] A custom category 'complyify' used to retrieve relevant incidents

## Supported Webhook Actions

1. TaskCreated - Complyify task opened against your organization

```
  {
    action: 'TaskCreated'
    appUrl <string> // Complyify task URL
    taskName <string>
  }
```

2. TaskClosed - Complyify task closed against your organization

```
  {
    action: 'TaskClosed'
    taskName <string>
  }
```

3. TaskRemoved - Complyify task removed (ex. task subject removed by system)

```
  {
    action: 'TaskRemoved'
    taskName <string>
  }
```
