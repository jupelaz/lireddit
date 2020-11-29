import { User } from "../entities/User";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import {MyContext} from "../types";
import argon2 from "argon2";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string
  @Field()
  password: string
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}
@ObjectType()
class UserResponse {
  @Field(() => [FieldError], {nullable: true})
  errors?: FieldError[];

  @Field(() => User, {nullable: true})
  user?: User;
}

@Resolver()
export class UserResolver {

  @Query(() => User, {nullable: true})
  async me(@Ctx() { em, req }: MyContext) {
    console.log("session: "+req.session);
    //you are not logged in
    if(!req.session.userId) {
      return null
    }

    
    const user = await em.findOne(User, { id: req.session.userId})
    return user;
  }
  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options : UsernamePasswordInput,
    @Ctx() { em } : MyContext
  ):Promise<UserResponse>{
    if (options.username.length <= 2) {
      return { 
        errors: [
          {
            field: 'username',
            message: "length must be greater than 2",
          },
        ],
      };
    }
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
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User,{username: options.username, password: hashedPassword});
    try{
      await em.persistAndFlush(user);
    }catch(err){
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
    @Ctx() { em, req } : MyContext
  ): Promise<UserResponse>{
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
    req.session.userId = user.id;
    return {user,};
  }
}