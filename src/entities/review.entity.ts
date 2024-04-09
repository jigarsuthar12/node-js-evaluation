import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ProductEntity } from "./product.entity";
import { UserEntity } from "./user.entity";

@Entity("review")
export class ReviewEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar" })
  description: string;

  @Column({ type: "int", nullable: true })
  rating: number;

  @Column({ type: "int", nullable: false })
  productId: number;

  @Column({ type: "int", nullable: false })
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => ProductEntity, product => product.reviews)
  @JoinColumn({ name: "productId" })
  product: ProductEntity[];

  @ManyToOne(() => UserEntity, user => user.reviews)
  @JoinColumn({ name: "userId" })
  user: UserEntity;
}
