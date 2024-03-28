import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CartItemEntity } from "./cartItem.entity";
import { UserEntity } from "./user.entity";

@Entity("cart")
export class CartEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", nullable: false })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => UserEntity, user => user.cart)
  @JoinColumn({ name: "userId" })
  user: UserEntity;

  @OneToMany(() => CartItemEntity, cart => cart.cart)
  cart: CartItemEntity;
}
