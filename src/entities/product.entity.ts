import { Category } from "@types";
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";



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
}
