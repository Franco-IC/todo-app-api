# todo-app-api
REST architecture API, performs CRUD operations on tasks and manages auth requests coming from the client, includes API keys creation/validation, MySQL DB hosted on PlanetScale.

<b> Important: </b> All requests will require an api_key header (excepting the `base url` and the `/api/api_key` endpoint which grants you an API key), also be mindful about `/api/api_key` having a max of 5 keys creations per day, with 15 uses per day for each key, both limits will be reset at 00:00 (Buenos Aires, Argentina). <br>
Because I was lazy I didn't wanted to code the API keys validation for the `/auth` endpoints, so I ended up restricting public API keys to `/tasks` endpoints only.

### Base URL: `site/api/`
### Endpoints:
## `/tasks`

### `GET` `/`
 - success: returns a JSON containing an array with all the Tasks in the DB.
 - exception: returns status 404 and a JSON with the message 'No tasks'.

``` bash
GET site/api/tasks


{
   [
     {
        "id": "1",
        "author": "user1",
        "title": "task title 1",
        "status": "pending",
        "description": "task description",
      },
      {
        "id": "2",
        "author": "user2",
        "title": "task title 2",
        "status": "done",
        "description": "task description",
      },
      {
        "id": "3",
        "author": "user3",
        "title": "task title 3",
        "status": "pending",
        "description": "task description",  
      },
  ]
}
```

### `POST` `/new`
 - expects: author, title, status, description properties.
 - success:  returns status 201 and a JSON containing the task created.
 - exception: returns a JSON with an error message.

``` bash
POST site/api/tasks/new


{
    {
      "id": "4",
      "author": "user4",
      "title": "new task title",
      "status": "pending",
      "description": "new task description",
    }
}
```

### `GET` `/id/:taskID`
 - expects: taskID.
 - success: returns a JSON containing the task.
 - exception: returns status 404 and a JSON with the message 'Task not found'.

``` bash
GET site/api/tasks/id/1


{
    {
      "id": "1",
      "author": "user1",
      "title": "task found by ID 1",
      "status": "pending",
      "description": "task description",
    },  
}
```

### `GET` `/author/:author`
 - expects: author (username).
 - success: returns a JSON containing the tasks for a given author.
 - exception: returns status 404 and a JSON with the message 'Author has no tasks created'.

``` bash
GET site/api/tasks/id/1


{
    {
      "id": "1",
      "author": "user1",
      "title": "user1 task",
      "status": "pending",
      "description": "task description",
    },
    {
      "id": "2",
      "author": "user1",
      "title": "user1 task",
      "status": "pending",
      "description": "task description",
    },
    {
      "id": "5",
      "author": "user1",
      "title": "user1 task",
      "status": "pending",
      "description": "task description",
    }, 

}
```

### `PUT` `/update/:taskID`
 - expects: fields to modify (author, title, status, description) + taskID to find the task to update.
 - success: returns a JSON containing the updated task.
 - exception: returns a JSON with an error message according to the issue.

``` bash
PUT site/api/tasks/update/4


{
   {
      "id": "4",
      "author": "user4",
      "title": "updated task title",
      "status": "done",
      "description": "updated task description",
   }
}
```

### `DELETE` `/delete/:taskID`
 - expects: taskID.
 - success: returns a JSON containing the message 'Task successfully deleted'.
 - exception: returns a JSON with an error message according to the issue.

``` bash
DELETE site/api/tasks/delete/4


{
   {
    "message": "Task succesfully deleted"
   }
}
```
