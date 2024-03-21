import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity("twoFactorAuthRequest")
export class TwoFactorAuthRequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "integer", nullable: false })
  userId: number;

  @Column({ type: "text", nullable: false })
  hashCode: string;

  @CreateDateColumn({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  createdAt: Date;
}
