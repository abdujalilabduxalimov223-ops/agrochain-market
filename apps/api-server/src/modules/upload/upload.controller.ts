import {
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRoleType } from '@prisma/client';
import { UploadService } from './upload.service';

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRoleType.FARMER)
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('product/:productId/image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `product-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
  if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
    cb(new Error('Faqat JPG, PNG, WEBP formatlar qabul qilinadi'), false);
  } else {
    cb(null, true);
  }
},
    }),
  )
  uploadImage(
    @Param('productId') productId: string,
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadService.uploadProductImage(productId, req.user.userId, file);
  }

  @Delete('product/:productId/image')
  deleteImage(
    @Param('productId') productId: string,
    @Req() req: any,
  ) {
    return this.uploadService.deleteProductImage(productId, req.user.userId);
  }
}