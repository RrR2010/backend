import { Membership } from '@modules/memberships/domain/membership.entity';

export abstract class MembershipRepository {
  abstract findById(id: string): Promise<Membership | null>;
  abstract findAll(): Promise<Membership[]>;
  abstract findByUserId(userId: string): Promise<Membership[] | null>;
  abstract save(Membership: Membership): Promise<Membership>;
  abstract delete(id: string): Promise<void>;
}
