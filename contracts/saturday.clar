;; title: Builder Rewards Contract V3 (Enhanced Fees) - Saturday
;; version: 3.0.0
;; summary: A Clarity contract for Stacks Builder Challenge with 1 STX fees and 1.5 STX rewards
;; description: Enhanced version with 1 STX check-in fee and 1.5 STX rewards. Restricted to Saturday.

;; constants
;;
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-already-claimed (err u101))
(define-constant err-not-found (err u102))
(define-constant err-invalid-amount (err u103))
(define-constant err-contract-inactive (err u104))
(define-constant err-insufficient-fee (err u105))
(define-constant err-wrong-day (err u106))

;; Fee constants (in microSTX)
(define-constant app-fee-check-in u1000000)     ;; 1 STX per check-in
(define-constant app-fee-claim u100000)         ;; 0.1 STX per claim
(define-constant app-fee-score u100000)         ;; 0.1 STX per score submission
(define-constant reward-amount u1500000)        ;; 1.5 STX reward

(define-constant required-day u6) ;; Saturday = 6

;; data vars
;;
(define-data-var total-rewards-distributed uint u0)
(define-data-var reward-pool uint u0)
(define-data-var contract-active bool true)

;; Fee tracking variables
(define-data-var total-fees-collected uint u0)
(define-data-var total-unique-users uint u0)
(define-data-var total-check-ins uint u0)
(define-data-var total-claims uint u0)

;; data maps
;;
(define-map user-claims principal bool)
(define-map user-scores principal uint)
(define-map daily-check-ins principal (list 365 uint))

;; User activity tracking
(define-map user-activity principal {
  first-interaction: uint,
  total-interactions: uint,
  total-fees-paid: uint
})

;; private functions

;; Calculate day of week
;; 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
(define-private (get-day-of-week)
    (let
        (
            (time (unwrap-panic (get-block-info? time (- block-height u1))))
            (days-since-epoch (/ time u86400))
        )
        (mod (+ days-since-epoch u4) u7)
    )
)

;; Track user activity and fees
(define-private (track-user (user principal) (fee-paid uint))
  (match (map-get? user-activity user)
    ;; Existing user - update stats
    activity (map-set user-activity user {
      first-interaction: (get first-interaction activity),
      total-interactions: (+ (get total-interactions activity) u1),
      total-fees-paid: (+ (get total-fees-paid activity) fee-paid)
    })
    ;; New user - create record and increment unique user count
    (begin
      (map-set user-activity user {
        first-interaction: stacks-block-height,
        total-interactions: u1,
        total-fees-paid: fee-paid
      })
      (var-set total-unique-users (+ (var-get total-unique-users) u1))
    )
  )
)

;; public functions
;;

;; Daily check-in: Pays 1 STX fee, gets 1.5 STX reward
(define-public (daily-check-in)
  (let
    (
      (caller tx-sender)
      (current-day (get-day-of-week))
      (current-day-index (/ stacks-block-height u144))
      (existing-check-ins (default-to (list) (map-get? daily-check-ins caller)))
    )
    (asserts! (var-get contract-active) err-contract-inactive)
    (asserts! (is-eq current-day required-day) err-wrong-day)
    (asserts! (>= (var-get reward-pool) reward-amount) err-invalid-amount)
    
    ;; Collect 1 STX fee
    (try! (stx-transfer? app-fee-check-in caller (as-contract tx-sender)))
    
    ;; Transfer 1.5 STX reward
    (try! (as-contract (stx-transfer? reward-amount tx-sender caller)))
    
    ;; Update pool and stats
    (var-set reward-pool (- (var-get reward-pool) reward-amount))
    (var-set total-rewards-distributed (+ (var-get total-rewards-distributed) reward-amount))
    (var-set total-fees-collected (+ (var-get total-fees-collected) app-fee-check-in))
    (var-set total-check-ins (+ (var-get total-check-ins) u1))
    
    ;; Track user
    (track-user caller app-fee-check-in)
    
    ;; Log event
    (print {
      event: "daily-check-in",
      user: caller,
      fee: app-fee-check-in,
      reward: reward-amount,
      day: current-day,
      total-fees: (var-get total-fees-collected)
    })
    
    ;; Add current day index to check-ins list (limited to 365)
    (ok (map-set daily-check-ins caller 
      (unwrap-panic (as-max-len? (append existing-check-ins current-day-index) u365))))
  )
)

;; Owner function to add to reward pool
(define-public (fund-rewards (amount uint))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
    (var-set reward-pool (+ (var-get reward-pool) amount))
    
    (print {event: "fund-rewards", amount: amount, new-pool: (var-get reward-pool)})
    (ok true)
  )
)

;; Owner function to withdraw collected fees
(define-public (withdraw-fees)
  (let
    (
      (fee-amount (var-get total-fees-collected))
    )
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (asserts! (> fee-amount u0) err-invalid-amount)
    
    ;; Transfer fees to owner
    (try! (as-contract (stx-transfer? fee-amount tx-sender contract-owner)))
    
    ;; Reset fee counter
    (var-set total-fees-collected u0)
    
    (print {event: "withdraw-fees", amount: fee-amount, recipient: contract-owner})
    (ok fee-amount)
  )
)

;; Toggle contract active status
(define-public (toggle-contract-status)
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (var-set contract-active (not (var-get contract-active)))
    (ok (var-get contract-active))
  )
)

;; Record user score
(define-public (record-score (score uint))
  (let
    (
      (caller tx-sender)
    )
    (asserts! (> score u0) err-invalid-amount)
    (asserts! (var-get contract-active) err-contract-inactive)
    
    (try! (stx-transfer? app-fee-score caller (as-contract tx-sender)))
    (track-user caller app-fee-score)
    (map-set user-scores caller score)
    (var-set total-fees-collected (+ (var-get total-fees-collected) app-fee-score))
    
    (print { event: "record-score", user: caller, score: score, fee: app-fee-score })
    (ok true)
  )
)

;; Claim reward (Legacy/Alternative)
(define-public (claim-daily-reward)
  (let
    (
      (caller tx-sender)
      (has-claimed (default-to false (map-get? user-claims caller)))
    )
    (asserts! (var-get contract-active) err-contract-inactive)
    (asserts! (not has-claimed) err-already-claimed)
    
    (try! (stx-transfer? app-fee-claim caller (as-contract tx-sender)))
    (track-user caller app-fee-claim)
    (map-set user-claims caller true)
    (var-set total-fees-collected (+ (var-get total-fees-collected) app-fee-claim))
    (var-set total-claims (+ (var-get total-claims) u1))
    
    (print { event: "claim-reward", user: caller, fee: app-fee-claim })
    (ok true)
  )
)

;; read only functions

(define-read-only (get-total-fees-collected) (ok (var-get total-fees-collected)))
(define-read-only (get-unique-user-count) (ok (var-get total-unique-users)))
(define-read-only (get-fee-summary)
  (ok {
    total-fees-collected: (var-get total-fees-collected),
    total-unique-users: (var-get total-unique-users),
    total-check-ins: (var-get total-check-ins),
    total-claims: (var-get total-claims),
    total-rewards-distributed: (var-get total-rewards-distributed),
    current-reward-pool: (var-get reward-pool),
    contract-active: (var-get contract-active),
    check-in-fee: app-fee-check-in,
    claim-fee: app-fee-claim,
    reward-amount: reward-amount
  })
)
(define-read-only (get-user-activity (user principal)) (ok (map-get? user-activity user)))
(define-read-only (get-user-score (user principal)) (ok (default-to u0 (map-get? user-scores user))))
(define-read-only (get-total-rewards) (ok (var-get total-rewards-distributed)))
(define-read-only (get-reward-pool) (ok (var-get reward-pool)))
(define-read-only (has-user-claimed (user principal)) (ok (default-to false (map-get? user-claims user))))
(define-read-only (get-check-in-count (user principal)) (ok (len (default-to (list) (map-get? daily-check-ins user)))))
(define-read-only (is-contract-active) (ok (var-get contract-active)))
