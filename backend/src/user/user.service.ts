import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import * as fs from 'fs';
import * as path from 'path';
import { UsernameDto } from './dtos/UsernameDto';
import { UpdatePwdDto } from './dtos/UpdatePwdDto';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  /* -------------------------------------------------------------------------- */
  /*                                   Private                                  */
  /* -------------------------------------------------------------------------- */

  private async findUserById(id: number) {
    return this.prismaService.user.findUnique({
      where: { id },
    });
  }

  private async findUserByUsername(username: string) {
    return this.prismaService.user.findUnique({
      where: { username },
    });
  }

  private async findUserAvatar(id: number) {
    return this.prismaService.user.findUnique({
      where: { id },
      select: { avatar: true },
    });
  }

  private async updateUserUsername(id: number, username: string) {
    return this.prismaService.user.update({
      where: { id },
      data: { username },
    });
  }

  private async updateUserAvatar(id: number, avatar: string) {
    return this.prismaService.user.update({
      where: { id },
      data: { avatar },
    });
  }

  private async updateUserPassword(id: number, password: string) {
    return this.prismaService.user.update({
      where: { id },
      data: { password },
    });
  }

  private exclude<User, Key extends keyof User>(
    user: User,
    keys: Key[],
  ): Omit<User, Key> {
    return Object.fromEntries(
      Object.entries(user).filter(([key]) => !keys.includes(key as Key)),
    ) as Omit<User, Key>;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   General                                  */
  /* -------------------------------------------------------------------------- */

  async getUser(req) {
    return this.getUserById(req.user.id);
  }

  async getAllUsers() {
    const users = await this.prismaService.user.findMany();
    return users;
  }

  async getUserById(id: number) {
    const user = await this.findUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userData = this.exclude(user, ['fortyTwoId', 'password']);
    return userData;
  }

  async getUserByUsername(username: string) {
    const user = await this.findUserByUsername(username);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const userData = this.exclude(user, ['fortyTwoId', 'password']);
    return userData;
  }

  /* -------------------------------------------------------------------------- */
  /*                                  Username                                  */
  /* -------------------------------------------------------------------------- */

  async changeUsername(req, body: UsernameDto) {
    const { username } = body;

    const user = await this.findUserById(req.user.id);
    if (!user) {
      throw new NotFoundException('User not found');
    } else if (user.username === username) {
      throw new ConflictException('You already have this username');
    } else if (await this.findUserByUsername(username)) {
      throw new ConflictException('This username is already taken');
    }

    await this.updateUserUsername(req.user.id, username);

    return { message: 'Username updated successfully' };
  }

  /* -------------------------------------------------------------------------- */
  /*                                  Password                                  */
  /* -------------------------------------------------------------------------- */

  async changePassword(req, body: UpdatePwdDto) {
    const { id } = req.user;
    const { password, newPassword } = body;

    const user = await this.findUserById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const matchPwd = await bcrypt.compare(password, user.password);
    if (!matchPwd) {
      throw new UnauthorizedException("Old password isn't valid");
    }

    const hashedPwd = await bcrypt.hash(newPassword, 10);
    await this.updateUserPassword(id, hashedPwd);

    return { message: 'Password updated successfully' };
  }

  /* -------------------------------------------------------------------------- */
  /*                                   Avatar                                   */
  /* -------------------------------------------------------------------------- */

  async getAvatar(filename: string, res) {
    const filePath = path.resolve('./uploads', filename);
    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Avatar not found');
    }
    res.sendFile(filePath);
  }

  async postAvatar(req, file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No avatar file provided');
    }

    const user = await this.findUserAvatar(req.user.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.avatar) {
      const filePath = path.resolve('./uploads', user.avatar);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await this.updateUserAvatar(req.user.id, file.filename);

    return { message: 'Avatar updated successfully' };
  }

  /* -------------------------------------------------------------------------- */
  /*                                 Friendship                                 */
  /* -------------------------------------------------------------------------- */

  // async getFriends(userId: number) {
  //   const user = await this.prismaService.user.findUnique({
  //     where: { id: userId },
  //     include: {
  //       userFriends: {
  //         where: { status: true },
  //         select: {
  //           friend: {
  //             select: {
  //               id: true,
  //               username: true,
  //               avatar: true,
  //             },
  //           },
  //         },
  //       },
  //       friendUserFriends: {
  //         where: { status: true },
  //         select: {
  //           user: {
  //             select: {
  //               id: true,
  //               username: true,
  //               avatar: true,
  //             },
  //           },
  //         },
  //       },
  //     },
  //   });

  //   const friends = [
  //     ...user.userFriends.map((friendship) => friendship.friend),
  //     ...user.friendUserFriends.map((friendship) => friendship.user),
  //   ];

  //   console.log(friends);

  //   return friends;
  // }

  // async addFriend(userId: number, friendId: number) {
  //   if (userId === friendId) {
  //     throw new BadRequestException("You can't send yourself a friend request");
  //   }

  //   await this.prismaService.friendship.create({
  //     data: {
  //       user: { connect: { id: userId } },
  //       friend: { connect: { id: friendId } },
  //     },
  //   });

  //   return { message: 'Friend request sent' };
  // }
}
