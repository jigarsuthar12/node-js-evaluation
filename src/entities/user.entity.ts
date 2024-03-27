import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CartEntity } from "./cart.entity";
import { OrderEntity } from "./order.entity";
import { ReviewEntity } from "./review.entity";

@Entity("user")
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "varchar", nullable: false })
  email: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  password: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  address: string;

  @Column({ type: "varchar", length: 15, nullable: true })
  number: string;

  @Column({ type: "boolean", nullable: true })
  is2FAEnabled: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: "varchar", nullable: false })
  userType: string;

  @OneToMany(() => ReviewEntity, review => review.user)
  reviews: ReviewEntity[];

  @OneToMany(() => CartEntity, cart => cart.user)
  cart: CartEntity[];

  @OneToMany(() => OrderEntity, order => order.user)
  order: OrderEntity[];
}
