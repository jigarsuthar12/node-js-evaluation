import { EPaymentMethod, EStatus } from "@types";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity("orders")
export class OrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", nullable: false })
  userId: number;

  @Column({ type: "uuid", nullable: true })
  paymentKey: string;

  @Column({ type: "json", nullable: true })
  paymentMetadata: object;

  @Column({
    type: "enum",
    enum: EPaymentMethod,
  })
  paymentMethod: EPaymentMethod;

  @Column({
    type: "enum",
    enum: EStatus,
    default: EStatus.PENDING,
  })
  status: EStatus;

  @Column({ type: "boolean", default: 0 })
  cancleFlag: boolean;

  @ManyToOne(() => UserEntity, user => user.order)
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
