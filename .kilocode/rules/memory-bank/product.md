# Product Context: Crystal One

## Why This Exists

Crystal One is an e-commerce platform designed for the Middle Eastern market (Egypt, Saudi Arabia, UAE, Kuwait, Libya) that combines online shopping with an earning opportunity. Users can subscribe to store levels, complete sales tasks, earn commissions, and grow their income through referrals.

## User Flows

### Registration Flow
1. User visits landing page
2. Clicks "Create Account"
3. Enters phone number, password, confirms password, invitation code
4. Phone number validated against allowed countries
5. Account created, unique invitation code generated
6. User redirected to dashboard

### Store Subscription Flow
1. User browses 10 store levels
2. First store (Level 1) is free - auto-subscribes
3. Paid stores require deposit -> admin approval -> subscription activated
4. Each store has different daily profit potential

### Task Flow
1. Tasks appear 1 hour after registration
2. New tasks generated at random intervals (60-240 minutes)
3. User sees product details, price, commission percentage
4. User accepts or declines task
5. On acceptance, commission credited to balance
6. New task scheduled after completion

### Deposit Flow
1. User selects recipient phone from available numbers
2. Enters sender phone and transfer amount
3. Attaches transfer screenshot
4. Submits request
5. Admin reviews and approves/rejects
6. On approval, balance updated

### Withdrawal Flow
1. User enters withdrawal amount (cannot exceed balance)
2. Enters payment phone number
3. Submits request (no image attachment)
4. Admin reviews and approves/rejects
5. On approval, balance deducted

### Referral Flow
1. User shares unique invitation code
2. New user registers with the code
3. Referral record created as "pending"
4. Admin approves referral
5. $10 credited to referrer's balance

## UX Goals

- Clean, modern interface with indigo/purple color scheme
- Full Arabic RTL support with language toggle
- Responsive design for mobile and desktop
- Real-time notifications with random names every 7 minutes
- Clear status indicators for all transactions
- Intuitive admin panel with full control

## Key Business Rules

- Store 1: Free, $2 daily profit
- Store 2-10: $80, $160, $320, $640, $1280, $2560, $5120, $10240, $20480
- Commission rates: 1-10% per level (admin configurable)
- Referral reward: $10 per approved referral
- Tasks schedule: 1 hour initial, then 60-240 minute random intervals
- Notifications: Random updates every 7 minutes
- All user data persists until explicit deletion
