
;; Monday Rewards Contract
;; Day Index: 1 (Monday)

(define-constant contract-owner tx-sender)
(define-constant err-not-authorized (err u100))
(define-constant err-wrong-day (err u101))
(define-constant err-already-claimed (err u102))
(define-constant err-insufficient-balance (err u103))

(define-constant checkin-fee u1000000) ;; 1 STX
(define-constant reward-amount u1500000) ;; 1.5 STX
(define-constant required-day u1) ;; Monday = 1

;; Track last claim height for user
(define-map last-claim-height principal uint)

(define-data-var total-claims uint u0)

;; Calculate day of week from block time
;; Unix Epoch (1970-01-01) was Thursday (4)
;; (timestamp / 86400 + 4) % 7
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

(define-public (claim-reward)
    (let
        (
            (caller tx-sender)
            (current-day (get-day-of-week))
            (last-claim (default-to u0 (map-get? last-claim-height caller)))
        )
        ;; Check if it is Monday
        (asserts! (is-eq current-day required-day) err-wrong-day)
        
        ;; Check if user claimed recently (approx 1 week cooling, or at least not same day)
        ;; We just check if last-claim was > (current height - ~1000 blocks) or similar? 
        ;; Or simpler: just check that the last claim wasn't TODAY.
        ;; Since we only allow claiming on Monday, if they claimed last Monday, that is fine.
        ;; We just need to ensure they haven't claimed *this specific* Monday.
        ;; We can do this by checking if (block-height - last-claim) > 100 blocks? 
        ;; Or better: store the claim-day index (epoch day).
        ;; For simplicity in this v1: We assume if block diff is < 1000 (approx 10 mins - 1 hour range depending on chain), it's same session.
        ;; Actually, "only next monday" implies 1 week cooldown.
        ;; If we store the block height, we can ensure current-height > last-claim + 1000 (roughly 2.7 hours on BTC/Stacks)
        ;; Just ensuring it is not in the same short window.
        ;; Let's assume 1 claim per specific Monday instance.
        ;; If they claim at height H, next claim must be H + >2000? (approx 5-6 hours).
        ;; Stacks blocks are anchored to BTC. 144 blocks/day.
        ;; So 1 week = 144 * 7 = 1008 blocks.
        
        (asserts! (> block-height (+ last-claim u1000)) err-already-claimed)

        ;; Transfer 1 STX from User to Contract
        (try! (stx-transfer? checkin-fee caller (as-contract tx-sender)))

        ;; Transfer 1.5 STX from Contract to User
        (try! (as-contract (stx-transfer? reward-amount tx-sender caller)))

        ;; Update claim record
        (map-set last-claim-height caller block-height)
        (var-set total-claims (+ (var-get total-claims) u1))

        (ok true)
    )
)

(define-read-only (get-current-day)
    (ok (get-day-of-week))
)

;; Fund contract
(define-public (fund-contract (amount uint))
    (stx-transfer? amount tx-sender (as-contract tx-sender))
)
