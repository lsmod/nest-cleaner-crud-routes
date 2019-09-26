# Cleaner routes with Nest

If you're beginning with Nest and you've followed the official documentation there is a few things that you could probably do better.

## Returning newly created items

When you make a POST request on RESTful API it generally returns the newly created item.

What do I mean by that ?

POST /users

```json
{
  "firstName": "Murphy",
  "lastName": "Eddie"
}
```

Should return `200` for a status code AND the following content:

```json
{
  "id": 378,
  "firstName": "Murphy",
  "lastName": "Eddie"
}
```
Returning the created item will be really useful when developing the  application using our API. For example, our application create a user and store it using the RESTful API. Then let's says our user change its password. In that case, our application will have to do a `PUT` on `/users/378`, right ? But if our API doesn't return newly created item, then when we make a that `PUT` request we wont know that `378` is our user id...

To achieve that we make our service return newly create item:
```typescript
async create(user: User): Promise<User> {
  return await this.userRepository.save(user);
}
```

and our controller do the same:
```typescript
@Post()
async create(@Body() user: CreateUserDto): Promise<User> {
  return await this.userService.create(user);
}
```


## Returning updated content

It's also important to return updated item when making a `PUT` operation. It will ensure that your application got exactly the same data as your API.\
It's also really nice to have some kind of visual confirmation when testing your `PUT` request with a tool like Postman.

From the user's service, you could do it in two different ways:
- save the received item in the database and then return it
- save the item, fetch it from database and then finally return the fetched item

I prefer the latter. Even tho it adds one database operation by doing so, you make sure your really return what you store in the database. While with the first option, really what you're returning its just what the user sent you..\
Also if there is some king of computing operation, performed in the entity of your item, the first option is not valid. For example: if you keep the date of the update in a field such as `updatedAt`. What you would do is use `@BeforeUpdate` annotation within `UserEntity` so the date get updated at each insert; and if you simply return the application request like this:
```typescript
await this.service.update(id, user);
return user;
```
Then the API's user won't get its item with `updatedAt` field set at the correct date.

A better way is to do it like this:
```typescript
return await this.service.update(id, user);
```
Simply return what you saved in the database.


## Wrong identifier

What if you try to delete an item that doesn't exists ?

`DELETE /users/87` (there is no user 87)

Perhaps it should return `404 not found error` or a `400 bad request error` instead. Otherwise our application won't have a clue that something wrong happen. Instead it will received `200` and believe DELETE operation went well (if we just follow nest documentation examples).

Same thing apply for an `PUT` request when trying to update an item with the wrong id. In fact I think it's more likely to occurs. For example: if we try to update an item that have been already deleted; or that haven't been saved yet.
It could happens in various scenario:
- connection broke during saving; our application didn't handle error correctly and believe our user is saved
- with shared resources among different user: one delete it, while the other doesn't know it got deleted
- offline cache not synchronize with remote API: user used API from it's phone got item in cache; then log onto from its laptop remove it; later get back to his phone then try to update it (item still in cache)

To fix this and return `404 not found` we simply have to try to fetch the item before to delete/update it; and if we don't find it we just throw a `404 not found` error.

And here is what our service like like:
```typescript
async delete(id: any): Promise<User> {
  let user = await this.findById(id)

  if (user == null) {
    throw new HttpException(
      `invalid id: ${id}`,
      HttpStatus.NOT_FOUND
    );
  }

  await this.userRepository.delete(user);
  return user;
}

async update(id: any, user: User): Promise<User> {
  // trying to update a user with an invalid id ?
  if (await this.findById(id) == null) {
    throw new HttpException(
      `invalid id: ${id}`,
      HttpStatus.NOT_FOUND,
    );
  }

  await this.userRepository.update(id, user);
  return await this.findById(id);
}

private async findById(id: number): Promise<User> {
  return await this.userRepository.findOne({
    where: [{ id: id }],
  });
}
```


## POST /UpdateOrCreate endpoint


One good thing to know is that if you try to update an item that doesn't exists typeorm will just create it for you... Which can lead to confusing situations.\
That leads me to thing it's pretty easy to create an `/UpdateOrCreate` endpoint.

All it take is this in your controller:

```typescript
return await this.service.update(id, user);
```

And that in your service:

```typescript
async updateOrCreate(id: any, user: User): Promise<User> {
  await this.userRepository.update(id, user);
  return await this.findById(id);
}
```

You may have come across this kind of endpoint when using some web API. It simply does what is say : create the item if it doesn't exist otherwise just update it.
