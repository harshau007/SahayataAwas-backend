import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, Timestamp, UpdateDateColumn } from "typeorm"
import { Roles } from "../common/role.enum"
import { PostEntity } from "src/post/entities/post.entity"

@Entity('users')
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({ select: false })
    password: string

    @Column({ unique: true })
    email: string

    @Column({type:'enum', enum: Roles, array: true, default: [Roles.STUDENT]})
    role: Roles[]

    @CreateDateColumn({type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP"})
    createdAt: Timestamp

    @UpdateDateColumn({type: "timestamp with time zone", onUpdate: "CURRENT_TIMESTAMP"})
    updatedAt: Timestamp

    @OneToMany(()=> PostEntity, (post)=> post.createdBy)
    posts: PostEntity
}
