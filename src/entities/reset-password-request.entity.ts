import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("resetPasswordRequest")
export class ResetPasswordRequestEntity {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: "integer", nullable: true })
  userId: number;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
