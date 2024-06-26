import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { OrderEntity } from "./order.entity";
import { ProductEntity } from "./product.entity";

@Entity("orderItem")
export class OrderItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "int", nullable: false })
  productId: number;

  @Column({ type: "int", nullable: false })
  orderId: number;

  @Column({ type: "int", nullable: true, default: 1 })
  quantity: number;

  @ManyToOne(() => ProductEntity, product => product.orderItem)
  @JoinColumn({ name: "productId" })
  product: ProductEntity;

  @ManyToOne(() => OrderEntity, order => order.id)
  @JoinColumn({ name: "orderId" })
  order: OrderEntity;
}
