import { Injectable } from '@nestjs/common';
import { GetAllActiveServicesUseCase } from '../use-cases/get-all-active-services.use-case';
import { AdminGetAllServicesUseCase } from '../use-cases/admin-get-all-services.use-case';
import { GetServiceBySlugUseCase } from '../use-cases/get-service-by-slug.use-case';
import { AdminCreateServiceUseCase } from '../use-cases/admin-create-service.use-case';
import { AdminUpdateServiceUseCase } from '../use-cases/admin-update-service.use-case';
import { CreatePurchaseUseCase } from '../use-cases/create-purchase.use-case';
import { ApprovePurchaseUseCase } from '../use-cases/approve-purchase.use-case';
import { GetUserPurchasesUseCase } from '../use-cases/get-user-purchases.use-case';
import { GetPendingPaymentsUseCase } from '../use-cases/get-pending-payments.use-case';
import { CancelPurchaseUseCase } from '../use-cases/cancel-purchase.use-case';
import { GetPurchaseByIdUseCase } from '../use-cases/get-purchase-by-id.use-case';
import { HolisticServiceResponseDto } from '../dto/holistic-service-response.dto';
import {
  HolisticServiceDetailResponseDto,
  HolisticServiceAdminResponseDto,
} from '../dto/holistic-service-response.dto';
import { PurchaseResponseDto } from '../dto/purchase-response.dto';
import { CreateHolisticServiceDto } from '../dto/create-holistic-service.dto';
import { UpdateHolisticServiceDto } from '../dto/update-holistic-service.dto';
import { CreatePurchaseDto, ApprovePurchaseDto } from '../dto/purchase.dto';

@Injectable()
export class HolisticServicesOrchestratorService {
  constructor(
    private readonly getAllActiveServicesUseCase: GetAllActiveServicesUseCase,
    private readonly adminGetAllServicesUseCase: AdminGetAllServicesUseCase,
    private readonly getServiceBySlugUseCase: GetServiceBySlugUseCase,
    private readonly adminCreateServiceUseCase: AdminCreateServiceUseCase,
    private readonly adminUpdateServiceUseCase: AdminUpdateServiceUseCase,
    private readonly createPurchaseUseCase: CreatePurchaseUseCase,
    private readonly approvePurchaseUseCase: ApprovePurchaseUseCase,
    private readonly getUserPurchasesUseCase: GetUserPurchasesUseCase,
    private readonly getPendingPaymentsUseCase: GetPendingPaymentsUseCase,
    private readonly cancelPurchaseUseCase: CancelPurchaseUseCase,
    private readonly getPurchaseByIdUseCase: GetPurchaseByIdUseCase,
  ) {}

  getAllActiveServices(): Promise<HolisticServiceResponseDto[]> {
    return this.getAllActiveServicesUseCase.execute();
  }

  adminGetAllServices(): Promise<HolisticServiceAdminResponseDto[]> {
    return this.adminGetAllServicesUseCase.execute();
  }

  getServiceBySlug(slug: string): Promise<HolisticServiceDetailResponseDto> {
    return this.getServiceBySlugUseCase.execute(slug);
  }

  adminCreateService(
    dto: CreateHolisticServiceDto,
  ): Promise<HolisticServiceAdminResponseDto> {
    return this.adminCreateServiceUseCase.execute(dto);
  }

  adminUpdateService(
    id: number,
    dto: UpdateHolisticServiceDto,
  ): Promise<HolisticServiceAdminResponseDto> {
    return this.adminUpdateServiceUseCase.execute(id, dto);
  }

  createPurchase(
    userId: number,
    dto: CreatePurchaseDto,
  ): Promise<PurchaseResponseDto> {
    return this.createPurchaseUseCase.execute(userId, dto);
  }

  approvePurchase(
    purchaseId: number,
    adminId: number,
    dto: ApprovePurchaseDto,
  ): Promise<PurchaseResponseDto> {
    return this.approvePurchaseUseCase.execute(purchaseId, adminId, dto);
  }

  getUserPurchases(userId: number): Promise<PurchaseResponseDto[]> {
    return this.getUserPurchasesUseCase.execute(userId);
  }

  getPendingPayments(): Promise<PurchaseResponseDto[]> {
    return this.getPendingPaymentsUseCase.execute();
  }

  cancelPurchase(
    purchaseId: number,
    requestingUserId: number,
    isAdmin: boolean,
  ): Promise<PurchaseResponseDto> {
    return this.cancelPurchaseUseCase.execute(
      purchaseId,
      requestingUserId,
      isAdmin,
    );
  }

  getPurchaseById(
    purchaseId: number,
    requestingUserId: number,
  ): Promise<PurchaseResponseDto> {
    return this.getPurchaseByIdUseCase.execute(purchaseId, requestingUserId);
  }
}
