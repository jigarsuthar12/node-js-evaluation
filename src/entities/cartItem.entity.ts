import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CartEntity } from "./cart.entity";
import { ProductEntity } from "./product.entity";

@Entity("cartItem")
export class CartItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", nullable: false })
  productId: number;

  @Column({ type: "int", nullable: false })
  cartId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: "int", nullable: true })
  quantity: number;

  @ManyToOne(() => ProductEntity, product => product.cart)
  @JoinColumn({ name: "productId" })
  product: ProductEntity;

  @ManyToOne(() => CartEntity, cart => cart.cart)
  @JoinColumn({ name: "cartId" })
  cart: CartEntity;
}
