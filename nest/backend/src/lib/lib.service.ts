import { HttpStatus, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import * as base32Encode from 'hi-base32';
import { extname } from 'path';
import { INTERNAL_SERVER_ERROR } from 'src/common/constant/http-error.constant';
import { CustomException } from 'src/common/custom-exception/custom-exception';
import * as fs from 'fs';
import { MAX_DATE } from '../../shared/constant';
import { Server } from 'socket.io';
import { SocketWithAuth } from 'src/auth/type';
import { SocketServerResponse } from 'src/common/types/socket-types';
import { STATUS } from '@prisma/client';
import { GeneralEvent } from 'shared/socket.event';
@Injectable()
export class LibService {
  private readonly dateModifiers: Record<
    string,
    (date: Date, value: number) => Date
  > = {
    MIN: this.addMinutes,
    HOURS: this.addHours,
    DAYS: this.addDays,
  };

  deleteSocketRoom(server: Server, room: string) {
    server.of('/').adapter.rooms.delete(room);
  }

  sendToSocket(
    instance: SocketWithAuth | Server,
    room: string,
    emit: string,
    object?: Partial<SocketServerResponse>,
  ) {
    if (object && object.message === undefined) object.message = '';

    if (room === GeneralEvent.BROADCAST) {
      if (!this.isSocketWithAuth(instance)) {
        instance.emit(emit, object);
        return;
      }
      instance.broadcast.emit(emit, object);
      return;
    }

    instance.to(room).emit(emit, object);
  }

  sendSameEventToSockets(
    instance: Server | SocketWithAuth,
    emit: string,
    data: {
      client?: SocketWithAuth;
      room: string;
      object?: Partial<SocketServerResponse>;
    }[],
  ) {
    data.forEach((data) => {
      this.sendToSocket(
        data.client ? data.client : instance,
        data.room,
        emit,
        data.object,
      );
    });
  }

  updateUserStatus(server: Server, data: { ids: string[]; status: STATUS }) {
    server.emit(GeneralEvent.USER_UPDATE_STATUS, { data });
  }

  addMinutes(date: Date, minutesToAdd: number): Date {
    return new Date(date.getTime() + minutesToAdd * 60000);
  }

  addHours(date: Date, hoursToAdd: number): Date {
    return new Date(date.getTime() + hoursToAdd * 3600000);
  }

  addDays(date: Date, daysToAdd: number): Date {
    return new Date(date.getTime() + daysToAdd * 86400000);
  }

  getEndBanTime(unit: string, date: Date, value: number): Date {
    if (value === Number.MAX_SAFE_INTEGER) return new Date(MAX_DATE);

    const modifier = this.dateModifiers[unit];
    return modifier(date, value);
  }

  generateRandomSecretInBase32(): string {
    const buffer = crypto.randomBytes(20);
    const truncatedBase32 = base32Encode
      .encode(buffer)
      .replace(/=/g, '')
      .substring(0, 24);

    return truncatedBase32;
  }

  checkIfString(data: any): boolean {
    return typeof data !== 'string' || data.length === 0;
  }

  generateFilename(file: Express.Multer.File) {
    return `${Date.now()}${extname(file.originalname)}`;
  }

  checkFolderFileExistence(path: string): boolean {
    if (fs.existsSync(path)) return true;

    return false;
  }

  deleteFile(path: string) {
    fs.unlink(path, () => {});
  }

  getSecondsSinceBegginingOfDate(date: Date): number {
    const now = new Date();
    return Math.round(Math.abs(date.getTime() - now.getTime()) / 1000);
  }

  createFile(directory: string, file: Express.Multer.File): string | undefined {
    if (!file) return undefined;

    if (!this.checkFolderFileExistence(directory)) fs.mkdirSync(directory);

    const filename = this.generateFilename(file);

    const uploadPath = directory + '/' + filename;

    fs.writeFile(uploadPath, file.buffer, (err) => {
      if (err)
        throw new CustomException(
          INTERNAL_SERVER_ERROR,
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
    });

    return filename;
  }

  private isSocketWithAuth(
    instance: SocketWithAuth | Server,
  ): instance is SocketWithAuth {
    return (instance as SocketWithAuth).userId !== undefined;
  }
}
