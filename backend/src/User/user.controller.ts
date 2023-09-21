import { Body, Controller, Get, HttpException, HttpStatus, Param, ParseIntPipe, Post, Req, Res, UsePipes, ValidationPipe } from "@nestjs/common";
import { UserService } from "./user.service";
import { User, serializedUser } from "./user.model";
import { Request, Response } from "express";
import { ChangeUsername, CreateUserDto } from "./user.dto";

@Controller('api/v1/user')

export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUser(): Promise<User[]> {
    return this.userService.getAllUsers();
  }
  @Get(':id')
  async GetUser(@Param('id', ParseIntPipe) id : number,
  @Res() res : Response,
  ) {
    const user = await this.userService.getUser(id);
    if (user){
      res.setHeader('Cache-Control', 'no-store');
      res.status(200).send(new serializedUser(user));
    }
    else{
      throw res.status(400).send({msg: 'User not found!'})
    }
  }
  @Post()
  @UsePipes(ValidationPipe)
  async postUser(@Body() createUserDto: CreateUserDto
  ){
    const user = await this.userService.createUser(createUserDto);
    if (user)
      return user
    else{
      throw new HttpException('User Exists', HttpStatus.BAD_REQUEST)
    }
  }
}
