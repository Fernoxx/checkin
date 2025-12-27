;; Checkin Smart Contract for Stacks Xverse
;; Tracks daily checkins and rewards users

(define-constant ERR-ALREADY-CHECKED-IN (err u1001))
(define-constant ERR-NOT-AUTHORIZED (err u1002))

(define-data-var total-checkins uint u0)
(define-data-var contract-owner principal (as-contract tx-sender))

;; Store checkin records: (user -> (day-index -> bool))
;; day-index = block-height / blocks-per-day (approx 144 blocks per day)
(define-map checkins { user: principal, day-index: uint } bool)

;; Store user stats: (user -> { streak: uint, total: uint, last-checkin-day: uint })
(define-map user-stats principal { streak: uint, total: uint, last-checkin-day: uint })

;; Calculate day index from block height (blocks per day ~144 for Stacks)
(define-private (get-day-index (block-height uint))
  (/ block-height u144)
)

;; Check if user has checked in today
;; Note: Requires block height parameter since read-only functions can't access current block
(define-read-only (has-checked-in-today (user principal) (current-block-height uint))
  (let ((today (get-day-index current-block-height)))
    (default-to false (map-get? checkins { user: user, day-index: today }))
  )
)

;; Get user statistics
(define-read-only (get-user-stats (user principal))
  (map-get? user-stats user)
)

;; Get total checkins count
(define-read-only (get-total-checkins)
  (var-get total-checkins)
)

;; Main checkin function
(define-public (checkin)
  (let ((user tx-sender)
        (current-block block-height)
        (today (get-day-index current-block)))
    (begin
      ;; Check if already checked in today
      (asserts! (not (default-to false (map-get? checkins { user: user, day-index: today }))) ERR-ALREADY-CHECKED-IN)
      
      ;; Record checkin
      (map-set checkins { user: user, day-index: today } true)
      
      ;; Update user stats
      (let ((current-stats (default-to { streak: u0, total: u0, last-checkin-day: u0 } (map-get? user-stats user))))
        (let ((last-day (get last-checkin-day current-stats))
              (current-streak (get streak current-stats))
              (current-total (get total current-stats)))
          (let ((new-streak 
                  (if (is-eq last-day u0)
                    u1
                    (if (is-eq last-day (- today u1))
                      (+ current-streak u1)
                      u1
                    )
                  )))
            (map-set user-stats user {
              streak: new-streak,
              total: (+ current-total u1),
              last-checkin-day: today
            })
          )
        )
      )
      
      ;; Update total checkins
      (var-set total-checkins (+ (var-get total-checkins) u1))
      
      (ok true)
    )
  )
)

;; Admin function to reset (for testing)
(define-public (reset-checkin (user principal) (day-index uint))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) ERR-NOT-AUTHORIZED)
    (map-delete checkins { user: user, day-index: day-index })
    (ok true)
  )
)

