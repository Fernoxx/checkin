;; Checkin Smart Contract for Stacks Xverse - V3
;; Tracks daily checkins and rewards users with 1.5 STX (1 STX fee)
;; Day cycle: ~144 blocks (approx 24 hours)

(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-already-checked-in (err u101))
(define-constant err-insufficient-funds (err u102))
(define-constant err-contract-inactive (err u103))

;; Fee and Reward constants
(define-constant app-fee-check-in u1000000)     ;; 1 STX per check-in
(define-constant reward-amount u1500000)        ;; 1.5 STX reward

;; Data Variables
(define-data-var total-fees-collected uint u0)
(define-data-var total-rewards-distributed uint u0)
(define-data-var reward-pool uint u0)
(define-data-var contract-active bool true)

;; Maps
;; Store check-in status: user -> day-index -> processed?
(define-map check-in-status { user: principal, day: uint } bool)
;; Store total check-ins per user
(define-map user-stats principal { total-checkins: uint, last-checkin-day: uint })

;; Private Functions
(define-private (get-day-index)
  (/ block-height u144)
)

;; Public Functions

;; Daily Check-In
;; User pays 1 STX, receives 1.5 STX
(define-public (daily-check-in)
  (let
    (
      (caller tx-sender)
      (current-day (get-day-index))
      (already-checked-in (default-to false (map-get? check-in-status { user: caller, day: current-day })))
    )
    (asserts! (var-get contract-active) err-contract-inactive)
    (asserts! (not already-checked-in) err-already-checked-in)
    (asserts! (>= (var-get reward-pool) reward-amount) err-insufficient-funds)

    ;; 1. User pays Fee (1 STX)
    (try! (stx-transfer? app-fee-check-in caller (as-contract tx-sender)))

    ;; 2. Contract pays Reward (1.5 STX)
    (try! (as-contract (stx-transfer? reward-amount tx-sender caller)))

    ;; 3. Update State
    (map-set check-in-status { user: caller, day: current-day } true)
    
    (let ((current-stats (default-to { total-checkins: u0, last-checkin-day: u0 } (map-get? user-stats caller))))
        (map-set user-stats caller {
            total-checkins: (+ (get total-checkins current-stats) u1),
            last-checkin-day: current-day
        })
    )

    ;; 4. Update Globals
    (var-set total-fees-collected (+ (var-get total-fees-collected) app-fee-check-in))
    (var-set total-rewards-distributed (+ (var-get total-rewards-distributed) reward-amount))
    (var-set reward-pool (- (var-get reward-pool) reward-amount))

    (print {
      event: "daily-check-in",
      user: caller,
      day: current-day,
      fee: app-fee-check-in,
      reward: reward-amount
    })

    (ok true)
  )
)

;; Owner: Fund the reward pool
(define-public (fund-rewards (amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (var-set reward-pool (+ (var-get reward-pool) amount))
    (ok true)
  )
)

;; Owner: Withdraw collected fees (or excess funds)
(define-public (withdraw-funds (amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (try! (as-contract (stx-transfer? amount tx-sender contract-owner)))
    (ok true)
  )
)

;; Read-only functions
(define-read-only (get-fee-summary)
  (ok {
    total-fees-collected: (var-get total-fees-collected),
    total-rewards-distributed: (var-get total-rewards-distributed),
    current-reward-pool: (var-get reward-pool),
    contract-active: (var-get contract-active),
    check-in-fee: app-fee-check-in,
    reward-amount: reward-amount
  })
)

(define-read-only (has-checked-in-today (user principal))
  (ok (default-to false (map-get? check-in-status { user: user, day: (get-day-index) })))
)

