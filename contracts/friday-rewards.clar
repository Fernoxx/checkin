
;; Friday Rewards Contract
;; Day Index: 5 (Friday)

(define-constant contract-owner tx-sender)
(define-constant err-not-authorized (err u100))
(define-constant err-wrong-day (err u101))
(define-constant err-already-claimed (err u102))
(define-constant err-insufficient-balance (err u103))

(define-constant checkin-fee u1000000) ;; 1 STX
(define-constant reward-amount u1500000) ;; 1.5 STX
(define-constant required-day u5) ;; Friday = 5

;; Track last claim height for user
(define-map last-claim-height principal uint)

(define-data-var total-claims uint u0)

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
        (asserts! (is-eq current-day required-day) err-wrong-day)
        (asserts! (> block-height (+ last-claim u1000)) err-already-claimed)

        (try! (stx-transfer? checkin-fee caller (as-contract tx-sender)))
        (try! (as-contract (stx-transfer? reward-amount tx-sender caller)))

        (map-set last-claim-height caller block-height)
        (var-set total-claims (+ (var-get total-claims) u1))

        (ok true)
    )
)

(define-read-only (get-current-day)
    (ok (get-day-of-week))
)

(define-public (fund-contract (amount uint))
    (stx-transfer? amount tx-sender (as-contract tx-sender))
)
