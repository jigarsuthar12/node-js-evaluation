import { Category } from "@types";
import { Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { CartEntity } from "./cart.entity";
import { OrderEntity } from "./order.entity";
import { ReviewEntity } from "./review.entity";

@Entity("product")
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", nullable: false })
  name: string;

  @Column({ type: "int", nullable: false })
  price: number;

  @Column({ type: "varchar", length: 255, nullable: false })
  imageUrl: string;

  @Column({ type: "varchar", length: 255, nullable: false })
  description: string;

  @Column({ type: "varchar", nullable: true })
  discount: string;

  @Column({
    type: "enum",
    enum: Category,
  })
  category: Category;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => ReviewEntity, review => review.product)
  reviews: ReviewEntity[];

  @ManyToMany(() => CartEntity, cart => cart.product)
  cart: CartEntity[];

  @ManyToMany(() => OrderEntity, order => order.product)
  order: OrderEntity[];
}
