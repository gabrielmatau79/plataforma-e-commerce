import {
  HttpException,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import axios, { AxiosError } from 'axios';

export function mapHttpError(error: unknown, defaultMessage: string): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string | string[] }>;

    if (axiosError.response) {
      const message = axiosError.response.data?.message ?? defaultMessage;
      throw new HttpException(message, axiosError.response.status);
    }

    throw new ServiceUnavailableException(defaultMessage);
  }

  if (error instanceof HttpException) {
    throw error;
  }

  throw new InternalServerErrorException(defaultMessage);
}
