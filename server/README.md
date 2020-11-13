Proyecto Full Stack
---

Un proyecto fullstack en el que se construye un backend y frontend desde 0 y se despliega.

Realizado siguendo el [curso](https://www.youtube.com/watch?v=I6ypD7qv3Z8) de Ben Awad

Incluye las tecnologias:
- React
- TypeScript
- GraphQL
- URQL/Apollo
- Node.js
- PostgreSQL
- MikroORM/TypeORM
- Redis
- Next.js
- TypeGraphQL
- Chakra
- VSCode
---
El primer paso a realizar es crear la carpeta en la que vamos a construir nuestro proyecto. Para ello, abrimos un terminal en nuestro espacio de trabajo, y introducimos:
```
mkdir lireddit-server
```
Vamos a la carpeta con:
```
cd lireddit-server
```
En este punto necesitaremos tener instalado node.Creamos un proyecto node con:
```
npm init -y
```
En este punto necesitaremos tener instalado node.Para editarlo usaremos VSCode, el cual abrimos en esta carpeta mediante:
```
code .
```
Añadimos a code las siguientes extensiones: Bracket Pair Colorizer, GraphQL for VSCode y Pretier. El autor del curso prefiere utilizar yarn en este punto(y yo tambien). En windows he instalado chocolatey(herramienta de instalacion via linea de comandos). 

Instalar: 
```
choco upgrade yarn
```
Actualizar: 
```
choco install yarn
```
En este proyecto queremos utilizar typescript, asi que lo añadimos al proyecto:
```
yarn add -D @types/node typescript ts-node
```
Y en el package.json reemplazamos:
```json
...
"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1"
  },
...
```
por:
```json
...
"scripts": {
    "start": "ts-node src/index.ts"
},
...
```
para que al lanzar npm run start, ejecute el archivo src/index.ts que crearemos ahora. En el, por ahora, solo introduciremos el siguiente codigo:
```js
console.log("Hola mundo!");
```
Tambien añadiremos un archivo de configuracion typescript mediante:
```
npx tsconfig.json
```
, eligiendo node como framework. Lanzamos `npm run start`, y si todo ha ido bien, `Hola mundo!` aparecera en la consola de comandos.

---
Utilizando ts-node ejecutamos los ficheros typescript como si fueran javascript. Pero ts-node es lento en ejecucion. Segun el autor del curso, es mas optimo mantener una consola revisando los cambios y convirtiendolos en javascript. Para ello, modificamos de nuevo `package.json`:
```json
"scripts": {
  "watch": "tsc -w",
  "start": "node dist/index.js",
  "start2": "ts-node src/index.ts"
},
```

Tambien añadiremos nodemon. [Nodemon](https://www.npmjs.com/package/nodemon) es un gestor de ejecuciones de node, el cual detecta cada cambio realizado en los ficheros, y reinicia la aplicacion de nuevo. Asi, mantenemos 3 terminales en ejecucion. Una con `yarn watch`, otra con `yarn dev` y otra tercera por si es necesaria. VSCode permite la ejecucion de tareas en el background, con lo que estas tareas podrian lanzarse en VSCode sin ocupar terminales, pero como el curso no lo contempla, lo añadire mas adelante, probablemente.

---
MikroORM
---
[MikroORM](https://mikro-orm.io/) es un [ORM](https://es.wikipedia.org/wiki/Asignaci%C3%B3n_objeto-relacional).  Para utilizarlo, añadimos lo siguiente mediante yarn:
```
yarn add @mikro-orm/cli @mikro-orm/core @mikro-orm/migrations @mikro-orm/postgresql pg
```
Tambien crearemos una base de datos PostgreSQL llamada lireddit con un usuario lireddit. Una vez hecho esto, añadiremos el siguiente codigo a index.ts:
```js
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";

const main = async () => {
  const orm = await MikroORM.init({
    dbName: 'lireddit',
    user: 'lireddit',
    password: '31753175',
    debug: !__prod__,
  });
}

main().catch((err) => console.log(err));
```
Tambien añadimos la definicion de entidades tal y como indica la pagina de [mikro-orm](https://mikro-orm.io/docs/defining-entities). Añadimos las entidades que vamos a utilizar en una nueva carpeta entities. Añadimos Post.ts:
```js
import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity()
export class Post {

  @PrimaryKey()
  id!: number;

  @Property()
  createdAt = new Date();

  @Property({ onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property()
  title!: string;

}
```
Añadimos el tratamiento de esta entidad a index.ts:
```js
...
import { Post } from "./entities/Post";
...
init({
  entities: [Post],
...
  const post = orm.em.create(Post, {title: 'my first post'});
  await orm.em.persistAndFlush(post);
}
...

```
Quedando index.ts de la siguiente forma:
```js
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";

const main = async () => {
  const orm = await MikroORM.init({
    entities: [Post],
    dbName: 'lireddit',
    user: 'lireddit',
    password: '31753175',
    debug: !__prod__,
    path: './migrations', // path to the folder with migrations
    pattern: /^[\w-]+\d+\.ts$/, // regex pattern for the migration files
  }); 

  const post = orm.em.create(Post, {title: 'my first post'});
  await orm.em.persistAndFlush(post);
}

main().catch((err) => console.log(err));
```
Siendo `orm` el gestor de base de datos, `orm.em` el gestor de entidades, y `post` el primer post definido.

Para usar mikroORM desde la consola de comandos, es decir, via CLI, la [documentacion](https://mikro-orm.io/docs/installation#setting-up-the-commandline-tool) de mikroORM indica que hay que añadir el objeto utilizado en .init al fichero `./src/mikro-orm.config.ts`:
```js
export default {
    entities: [Post],
    dbName: 'lireddit',
    user: 'lireddit',
    password: '31753175',
    debug: !__prod__,
};
```
En este punto, indica que, al exportar el archivo, pierde sus cualidades, con lo que intenta exportarlo `as const`. Pero esto no le gusta a typescript, con lo que modifica el fichero `./src/mikro-orm.config.ts` de la siguiente manera:
```js
export default {
    entities: [Post],
    dbName: 'lireddit',
    user: 'lireddit',
    password: '31753175',
    debug: !__prod__,
}as Parameters<typeof MikroORM.init>[0];
```
Me quedaria pendiente revisar el video, y añadir una explicacion de como ha obtenido esa informacion (TODO).

Tambien quiere habilitar [migraciones](https://mikro-orm.io/docs/migrations/) via CLI, asi que añadimos al init el path y pattern de las migraciones, ya que el resto de parametros no nos son necesarios:
```js
export default {
    entities: [Post],
    dbName: 'lireddit',
    user: 'lireddit',
    password: '31753175',
    debug: !__prod__,
}as Parameters<typeof MikroORM.init>[0];
```
Añadimos la funcion path, integrada en node, para concatenar migrations con el directorio actual(entiendo que, para cuando se migre a otro servidor, mantenga la estructura), y tambien modificamos en pattern ts por [tj]s, permitiendo archivos typescript y javascript:
```js
import path from 'path';
...
    path: path.join(__dirname, "./migration"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
...
```
El objetivo de la migracion es crear la tabla que vamos a utilizar. Asi pues, creamos una migracion con el siguiente comando:
```
npx mikro-orm migration:create
```
Esto nos genera el siguiente archivo en la carpeta migration:
```js
import { Migration } from '@mikro-orm/migrations';

export class Migration20201031091353 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "post" ("id" serial primary key, "created_at" jsonb not null, "updated_at" jsonb not null, "title" varchar(255) not null);');
  }
```
Pero no nos interesa el tipo de datos que tienen created_at(jsonb), updated_at(jsonb), y title(varchar(255)). Asi que, en la entidad Post, modificamos el tipo de cada propiedad, de la siguiente manera:
```js
...
  @Property({type: 'date'})
  createdAt = new Date();

  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();

  @Property({type: 'text'})
  title!: string;
...
```
Ahora la migracion es correcta, la cual creara una tabla con los parametros que necesitamos. Podemos ejecutar la migracion desde CLI, pero nos interesa mas crearla al inicializar el programa, para que cree la tabla si es necesario. Para esto, añadimos lo siguiente a `index.ts`:
```js
  const orm = await MikroORM.init(microConfig);ç
  await orm.getMigrator().up(); // Añadimos esta linea para cargar el migrator
  const post = orm.em.create(Post, {title: 'my first post'});
```

Llegado a este punto, suceden varios posibles errores. Al autor le sucede, que al haber creado varias migrations, en la carpeta dist hay varias y se ejecutan todas. Tambien puede pasar que el usuario de la tabla no tenga permisos. Al autor le daba un error al usar el insert nativeInsert, ya que no cogia los valores por defecto. Despues de solventar todos los errores, y ejecutar una vez o varias, generando datos en la tabla, añadimos en `index.ts`: 
```js
  // const post = orm.em.create(Post, {title: 'my first post'});
  // await orm.em.persistAndFlush(post);
  const posts = await orm.em.find(Post,{});
  console.log(posts);
```
Llegado a este punto, damos por finalizada la parte de configuracion de postgresql.

---
GraphQL
---
Añadimos ahora las dependencias necesarias para usar graphql:
```
yarn add express apollo-server-express graphql type-graphql
```
Antes que nada montamos un servidor express. Express es un metodo facil de montar un servidor. Modificamos `index.ts`:
```js
import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
import { Post } from './entities/Post';
import microConfig from './mikro-orm.config';
import express from 'express';

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  const app = express();
  app.get('/', (_,res) => {
    res.send('hello');
  })
  app.listen(4000, () => {
      console.log('server started on localhost:4000');
      
  });
}

main().catch((err) => console.log(err));
```
Basicamente, creamos una constante app y le damos el valor de servidor express. Le añadimos una funcion get, que devuelve hello para comprobar que funciona, y arrancamos ese servidor en el puerto 4000. Si vamos a localhost:4000, deberia salir una pagina web con el texto hello unicamente. Pero como no queremos montar un servidor REST, sino uno graphql, eliminamos la linea de app.get, y añadimos el siguiente codigo:
```js
...
const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver],
      validate: false,
    })
  })

  apolloServer.applyMiddleware({app});
...
```
El resolver HelloResolver no lo hemos creado aun, asi que lo creamos en la ubicacion resolvers/hello.ts:
```js
import { Query, Resolver } from "type-graphql";

@Resolver()
export class HelloResolver {
  @Query(() => String)
  hello(){
    return 'hello world';
  }
}
```
Con esto, lo que conseguimos, es que si accedemos a localhost:400/graphql, accedemos a una utilidad que permite probar nuestras sentencias graphql. En este caso, si introducimos:
```graphql
{
  hello
}
```
obtenemos:
```graphql
{
  "data": {
    "hello": "hello world"
  }
}
```
Añadimos un resolver para los post, el cual nos sirva para las operaciones CRUD basicas:
```js
import { Post } from "../entities/Post";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";
import {MyContext} from "../types";

@Resolver()
export class PostResolver {

  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]>{
    return em.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  post(
    @Arg("id", () => Int) id: number,
    @Ctx() { em } : MyContext
  ): Promise<Post | null> {
    return em.findOne(Post, { id });
  }

  @Mutation(() => Post)
  async createPost(
    @Arg("title") title: string,
    @Ctx() { em } : MyContext
  ): Promise<Post> {
    const post = em.create(Post, { title });
    await em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post, { nullable : true })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title", () => String, { nullable: true}) title: string,
    @Ctx() { em } : MyContext
  ): Promise<Post | null> {
    const post = await em.findOne(Post, { id });
    if (!post) {
      return null;
    }
    if (typeof title !== 'undefined') {
      post.title = title;
      await em.persistAndFlush(post);
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id") id: number,
    @Ctx() { em } : MyContext
  ): Promise<boolean> {
    try{
      await em.nativeDelete(Post, {id});
      return true;
    }catch{
      return false;
    }
  }
}
```
Todo lo que son consultas se marcan como queries, y las actualizaciones como mutations. Hemos añadido como variable de contexto em o entity manager, para realizar las operaciones correspondientes. Para definir el tipo de em, hemos creado types.ts en el cual definimos el tipo del contexto:
```js
import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";

export type MyContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>
}
```
Tenemos que añadir el resolver de posts al index.ts inicial:
```js
...
resolvers: [HelloResolver, PostResolver],
...
```
Y creo que con esto estaria la parte de consultar Posts desde graphql. Tambien tendriamos que añadir usuarios para la aplicacion. Añadimos la entidad User.ts:
```js
import { Entity, PrimaryKey, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';

@ObjectType()
@Entity()
export class User {

  @Field()
  @PrimaryKey()
  id!: number;

  @Field(() => Date)
  @Property({type: 'date'})
  createdAt = new Date();

  @Field(() => Date)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field()
  @Property({type: 'text', unique: true})
  username!: string;

  @Property({ type: 'text' })
  password!: string;
}
```
Hemos eliminado `@Field()` de password, para evitar que se pueda acceder desde graphql. Añadimos tambien la entidad User a la configuracion de mikro-orm, `mikro-orm.config.ts`:
```js
...
  entities: [Post, User],
...
```
Dentro del resolver del usuario, necesitaremos realizar funciones Graphql para register y login. El resultado final es este:
```js
import { User } from "../entities/User";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver } from "type-graphql";
import {MyContext} from "../types";
import argon2 from "argon2"; // Añadimos el import argon2 para gestionar contraseñas

//Creamos una clase para unificar la entrada de usuario y contraseña, ya que es comun a login y register
@InputType()
class UsernamePasswordInput{
  @Field()
  username: string
  @Field()
  password: string
}

//Y otra clase comun para gestion de errores
@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}
//Generamos una ultima clase para el retorno, el cual incluye el usuario y la clase seleccionada anteriormente. Ambos son opcionales, para que se pueda devolver uno, otro, ambos, o ninguno
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], {nullable: true})
  errors?: FieldError[];

  @Field(() => User, {nullable: true})
  user?: User;
}

@Resolver()
export class UserResolver {

  @Mutation(() => User)
  async register(
    @Arg("options") options : UsernamePasswordInput,
    @Ctx() { em } : MyContext
  ):Promise<UserResponse>{
    //Si la longitud del usuario es 2 o menos, devolvemos error
    if (options.username.length <= 2) {
      return { 
        errors: [
          {
            field: 'username',
            message: "length must be greatter than 2",
          },
        ],
      };
    }
    //Si la longitud de la contraseña es 2 o menos, devolvemos error
    if (options.password.length <= 2) {
      return { 
        errors: [
          {
            field: 'password',
            message: "length must be greatter than 2",
          },
        ],
      };
    }
    //Convertimos la contraseña en un hash de argon2
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User,{username: options.username, password: hashedPassword});
    try{
      await em.persistAndFlush(user);
    }catch(err){
      //Si el usuario ya existe
      if (err.code === '23505' || err.detail.includes("already exists")){
        return {errors: [
          {
            field: "username",
            message: "username already taken",
          }
        ]}
      }
      console.log(err)
    }
    return {user,};
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options : UsernamePasswordInput,
    @Ctx() { em } : MyContext
  ): Promise<UserResponse>{
    //Si la longitud del usuario es 2 o menos, devolvemos error
    if (options.username.length <= 2) {
      return { 
        errors: [
          {
            field: 'username',
            message: "length must be greatter than 2",
          },
        ],
      };
    }
    //Si la longitud de la contraseña es 2 o menos, devolvemos error
    if (options.password.length <= 2) {
      return { 
        errors: [
          {
            field: 'password',
            message: "length must be greatter than 2",
          },
        ],
      };
    }
    //Si el usuario no existe
    const user = await em.findOne(User,{username: options.username.toLowerCase()});
    if(!user){
      return { 
        errors: [
          {
            field: 'username',
            message: "that username doesn't exist",
          },
        ],
      };
    }
    //Contraseña incorrecta
    const valid = await argon2.verify(user.password, options.password);
    if(!valid){
      return { 
        errors: [
          {
            field: 'username',
            message: "incorrect password",
          },
        ],
      };
    }
    return {user,};
  }
}
```
Es una especificacion rapida de lo que se ha añadido para no hacer el proceso muy largo. Hemos añadido argon2 mediante `yarn add argon2`.

---
Lo siguiente seria añadir sesiones para mantener de usuario, para eso añadimos `yarn add express-session`. Tambien usa redis, el cual tiene una version antigua en windows: https://github.com/MicrosoftArchive/redis/releases. Yo he tenido que añadir al path de sistema: C:\Program Files\Redis 

Copiamos el ejemplo de [connect-redis](github.com/tj/connect-redis):
```js
const redis = require('redis')
const session = require('express-session')

let RedisStore = require('connect-redis')(session)
let redisClient = redis.createClient()

app.use(
  session({
    store: new RedisStore({ client: redisClient }),
    secret: 'keyboard cat',
    resave: false,
  })
)

```