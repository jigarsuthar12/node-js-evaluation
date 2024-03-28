import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProductEntity } from "./product.entity";
import { UserEntity } from "./user.entity";

@Entity("cart")
export class CartEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", nullable: false })
  productId: number;

  @Column({ type: "int", nullable: false })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ProductEntity, product => product.cart)
  @JoinColumn({ name: "productId" })
  product: ProductEntity;

  @ManyToOne(() => UserEntity, user => user.cart)
  @JoinColumn({ name: "userId" })
  user: UserEntity;
}
