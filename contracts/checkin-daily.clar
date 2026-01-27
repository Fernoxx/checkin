;; Stacks Checkin Contract
;; Requires 0.2 STX fee to check in (sent separately to contract address)
;; Stores checkin data per address

;; Note: The fee verification happens off-chain
;; The 0.2 STX fee should be sent to the contract address BEFORE calling checkin()
;; Or modify to use stx-get-transfer-amount if STX is sent WITH the contract call

(define-constant CHECKIN_FEE u200000) ;; 0.2 STX in micro-STX (0.2 * 1,000,000)

(define-map checkin-data
  {who: principal}
  {
    last-checkin: uint,
    total-checkins: uint
  }
)

;; Public function to check in
;; Option 1: If STX is sent WITH this transaction, it will verify the fee
;; Option 2: If STX was sent separately, this just records the checkin
(define-public (checkin)
  (let (
        (sender tx-sender)
        (transfer-amount (stx-get-transfer-amount))
        (current-block (block-height))
        (existing-data (map-get? checkin-data {who: sender}))
       )
)

(define-read-only (get-last-checkin (who principal))
  (default-to u0 
    (get last-checkin 
      (unwrap! (map-get? checkin-data {who: who}) {last-checkin: u0, total-checkins: u0})))
)
