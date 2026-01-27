;; Stacks Checkin Contract
;; Requires 0.2 STX fee to check in (sent separately to contract address)
;; Stores checkin data per address

;; Note: The fee verification happens off-chain
;; The 0.2 STX fee should be sent to the contract address BEFORE calling checkin()
;; Or modify to use stx-get-transfer-amount if STX is sent WITH the contract call

(define-constant CHECKIN_FEE u100000) ;; 0.1 STX in micro-STX (0.1 * 1,000,000)

(define-map checkin-data
  {who: principal}
  {
    last-checkin: uint,
    total-checkins: uint
  }
)

;; Public function to check in
;; The user pays 0.1 STX fee which is transferred to the contract address
(define-public (checkin)
  (let (
        (sender tx-sender)
        (current-block (block-height))
        (existing-data (map-get? checkin-data {who: sender}))
       )
    ;; Transfer the fee from the user to the contract
    (try! (stx-transfer? CHECKIN_FEE sender (as-contract tx-sender)))
    
    ;; Store or update checkin data
    (let ((current-total (if (is-none existing-data) 
                            u0 
                            (get total-checkins (unwrap! existing-data {last-checkin: u0, total-checkins: u0})))))
      (map-set checkin-data 
        {who: sender} 
        {
          last-checkin: current-block,
          total-checkins: (+ current-total u1)
        }
      )
      (ok true))))

;; Read-only functions to query checkin data
(define-read-only (get-checkin-data (who principal))
  (map-get? checkin-data {who: who})
)

(define-read-only (get-last-checkin (who principal))
  (default-to u0 
    (get last-checkin 
      (unwrap! (map-get? checkin-data {who: who}) {last-checkin: u0, total-checkins: u0})))
)

(define-read-only (get-total-checkins (who principal))
  (default-to u0 
    (get total-checkins 
      (unwrap! (map-get? checkin-data {who: who}) {last-checkin: u0, total-checkins: u0})))
)
