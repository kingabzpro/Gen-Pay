export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          phone: string | null
          kyc_status: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          network: string
          address: string
          encrypted_private_key: string
          balance: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['wallets']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['wallets']['Insert']>
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          from_wallet_id: string | null
          to_wallet_id: string | null
          type: 'SEND' | 'RECEIVE' | 'DEPOSIT' | 'WITHDRAW'
          amount: number
          network: string
          tx_hash: string | null
          status: 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED'
          fee: number
          metadata: Json | null
          confirmed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['transactions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['transactions']['Insert']>
      }
      kyc_documents: {
        Row: {
          id: string
          user_id: string
          document_type: 'PASSPORT' | 'ID_CARD' | 'DRIVING_LICENSE' | 'PROOF_OF_ADDRESS'
          document_number: string | null
          document_url: string
          status: 'PENDING' | 'APPROVED' | 'REJECTED'
          reviewed_at: string | null
          reviewed_by: string | null
          rejection_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['kyc_documents']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['kyc_documents']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: string
          title: string
          message: string
          data: Json | null
          is_read: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
    }
  }
}
