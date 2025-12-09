# Gen Pay Platform - Architecture Diagrams

## 🏗️ High-Level Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        A[Next.js Frontend]
        B[Mobile App - Future]
    end
    
    subgraph "Vercel"
        C[Vercel Edge Network]
        D[Static Assets]
        E[Serverless Functions]
    end
    
    subgraph "Supabase"
        F[Supabase Auth]
        G[PostgreSQL Database]
        H[Supabase Storage]
        I[Edge Functions]
        J[Realtime Engine]
    end
    
    subgraph "External Services"
        K[Tron Network]
        L[TronGrid API]
        M[Email Service]
    end
    
    A --> C
    A --> E
    C --> F
    C --> G
    C --> H
    C --> I
    I --> L
    I --> K
    G --> J
    J --> A
    F --> M
```

## 🔄 User Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant S as Supabase Auth
    participant DB as Database
    
    U->>F: Register/Login
    F->>S: Auth Request
    S->>DB: Create/Verify User
    S-->>F: Auth Token
    F-->>U: Success/Error
    F->>DB: Create Profile
    F->>F: Store Auth Token
```

## 💳 Wallet Creation Flow

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant EF as Edge Function
    participant T as Tron Network
    participant DB as Database
    
    U->>F: Create Wallet
    F->>EF: Request Wallet Creation
    EF->>T: Generate Tron Address
    T-->>EF: Return Address & Private Key
    EF->>EF: Encrypt Private Key
    EF->>DB: Store Wallet Data
    DB-->>EF: Confirmation
    EF-->>F: Wallet Created
    F-->>U: Show Wallet Address
```

## 🔄 P2P Transfer Flow

```mermaid
sequenceDiagram
    participant S as Sender
    participant F as Frontend
    participant EF as Edge Function
    participant T as Tron Network
    participant DB as Database
    participant R as Receiver
    participant RT as Realtime
    
    S->>F: Initiate Transfer
    F->>EF: Transfer Request
    EF->>DB: Validate Balances
    DB-->>EF: Validation OK
    EF->>T: Submit Transaction
    T-->>EF: Transaction Hash
    EF->>DB: Create Transaction Record
    DB-->>RT: Trigger Realtime Update
    RT->>F: Update Sender UI
    RT->>R: Update Receiver UI
    T->>T: Confirm Transaction
    T->>EF: Confirmation Callback
    EF->>DB: Update Transaction Status
```

## 📊 Database Schema Relationships

```mermaid
erDiagram
    PROFILES {
        uuid id PK
        text email UK
        text first_name
        text last_name
        text phone
        text kyc_status
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    WALLETS {
        uuid id PK
        uuid user_id FK
        text network
        text address UK
        text encrypted_private_key
        decimal balance
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    TRANSACTIONS {
        uuid id PK
        uuid user_id FK
        uuid from_wallet_id FK
        uuid to_wallet_id FK
        text type
        decimal amount
        text network
        text tx_hash UK
        text status
        decimal fee
        json metadata
        timestamp confirmed_at
        timestamp created_at
        timestamp updated_at
    }
    
    KYC_DOCUMENTS {
        uuid id PK
        uuid user_id FK
        text document_type
        text document_number
        text document_url
        text status
        timestamp reviewed_at
        uuid reviewed_by FK
        text rejection_reason
        timestamp created_at
        timestamp updated_at
    }
    
    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        text type
        text title
        text message
        json data
        boolean is_read
        timestamp created_at
    }
    
    PROFILES ||--o{ WALLETS : owns
    PROFILES ||--o{ TRANSACTIONS : creates
    PROFILES ||--o{ KYC_DOCUMENTS : submits
    PROFILES ||--o{ NOTIFICATIONS : receives
    WALLETS ||--o{ TRANSACTIONS : sends
    WALLETS ||--o{ TRANSACTIONS : receives
```

## 🔐 Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        A[Authentication Layer]
        B[Authorization Layer]
        C[Data Encryption Layer]
        D[Network Security Layer]
    end
    
    subgraph "Authentication"
        E[Supabase Auth]
        F[JWT Tokens]
        G[Session Management]
    end
    
    subgraph "Authorization"
        H[Row Level Security]
        I[Role-Based Access]
        J[API Key Management]
    end
    
    subgraph "Data Protection"
        K[Encrypted Private Keys]
        L[SSL/TLS Encryption]
        M[Environment Variables]
    end
    
    subgraph "Network Security"
        N[CORS Configuration]
        O[Rate Limiting]
        P[Input Validation]
    end
    
    A --> E
    A --> F
    A --> G
    B --> H
    B --> I
    B --> J
    C --> K
    C --> L
    C --> M
    D --> N
    D --> O
    D --> P
```

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        A[Local Development]
        B[Supabase Local]
        C[Git Repository]
    end
    
    subgraph "CI/CD"
        D[GitHub Actions]
        E[Vercel CI]
        F[Automated Testing]
    end
    
    subgraph "Production"
        G[Vercel Edge Network]
        H[Supabase Production]
        I[Custom Domain]
        J[SSL Certificate]
    end
    
    subgraph "Monitoring"
        K[Vercel Analytics]
        L[Supabase Dashboard]
        M[Error Tracking]
    end
    
    A --> C
    C --> D
    D --> E
    E --> F
    F --> G
    G --> H
    H --> I
    I --> J
    G --> K
    H --> L
    G --> M
```

## 📱 Component Architecture

```mermaid
graph TB
    subgraph "Pages"
        A[Login/Register]
        B[Dashboard]
        C[Wallet]
        D[Transactions]
        E[KYC Verification]
    end
    
    subgraph "Components"
        F[Auth Forms]
        G[Wallet Cards]
        H[Transaction List]
        I[KYC Upload]
        J[Navigation]
    end
    
    subgraph "Hooks"
        K[useAuth]
        L[useWallet]
        M[useTransactions]
        N[useRealtime]
    end
    
    subgraph "Services"
        O[Supabase Client]
        P[Tron Service]
        Q[Storage Service]
        R[Realtime Service]
    end
    
    A --> F
    B --> G
    B --> H
    C --> G
    D --> H
    E --> I
    F --> K
    G --> L
    H --> M
    I --> K
    K --> O
    L --> P
    M --> O
    N --> R
```

## 🔄 Real-time Data Flow

```mermaid
sequenceDiagram
    participant DB as Database
    participant RT as Realtime Engine
    participant S as Supabase
    participant F as Frontend
    participant U as User Interface
    
    Note over DB: Transaction Created
    DB->>RT: Trigger Change Event
    RT->>S: Broadcast Update
    S->>F: Push Notification
    F->>U: Update UI
    U->>U: Show New Transaction
    
    Note over DB: Balance Updated
    DB->>RT: Trigger Change Event
    RT->>S: Broadcast Update
    S->>F: Push Notification
    F->>U: Update Balance
    U->>U: Refresh Wallet Card
```

## 🎯 Technology Stack Integration

```mermaid
graph LR
    subgraph "Frontend Stack"
        A[Next.js 16]
        B[TypeScript]
        C[Tailwind CSS]
        D[shadcn/ui]
        E[Zustand]
    end
    
    subgraph "Backend Stack"
        F[Supabase]
        G[PostgreSQL]
        H[Edge Functions]
        I[Realtime]
    end
    
    subgraph "Blockchain Stack"
        J[TronWeb]
        K[TronGrid API]
        L[TRC20 USDT]
    end
    
    subgraph "Deployment Stack"
        M[Vercel]
        N[Supabase Hosting]
        O[Custom Domain]
    end
    
    A --> F
    B --> F
    C --> A
    D --> A
    E --> A
    F --> G
    F --> H
    F --> I
    H --> J
    J --> K
    K --> L
    A --> M
    F --> N
    M --> O
```

These diagrams provide a comprehensive visual representation of the Gen Pay platform's architecture, data flows, and component relationships. They serve as a reference for implementation and help ensure all team members understand the system's design and interactions.