
DOCKER_COMPOSE=docker-compose
API_URL=http://localhost:4000/api/v1


.PHONY: test-create-promo
test-create-promo:
	curl -s -X POST $(API_URL)/promocodes \
	-H "Content-Type: application/json" \
	-d '{"code": "PROMO10", "discountPercent": 10, "activationLimit": 5, "expiresAt": "2027-12-31T23:59:59Z"}' \
	| jq

.PHONY: test-get-promo
test-get-promo:
	curl -s -X GET $(API_URL)/promocodes/1 | jq

.PHONY: test-get-all-promos
test-get-all-promos:
	curl -s -X GET $(API_URL)/promocodes | jq

.PHONY: test-activate-promo
test-activate-promo:
	curl -s -X POST $(API_URL)/promocodes/1/activate \
	-H "Content-Type: application/json" \
	-d '{"email": "test@example.com"}' \
	| jq

.PHONY: test-activate-promo-again
test-activate-promo-again:
	curl -s -X POST $(API_URL)/promocodes/1/activate \
	-H "Content-Type: application/json" \
	-d '{"email": "test@example.com"}' \
	| jq

.PHONY: test-activate-nonexistent-promo
test-activate-nonexistent-promo:
	curl -s -X POST $(API_URL)/promocodes/999/activate \
	-H "Content-Type: application/json" \
	-d '{"email": "someone@example.com"}' \
	| jq

.PHONY: test-activate-promo-overlimit
test-activate-promo-overlimit:
	@echo "Activate a promo beyond its limit (adjust IDs/emails as needed)"
	# Здесь нужно вызвать активации больше чем лимит promo
	# Например:
	# for i in 1 2 3 4 5 6; do \
	#   curl -s -X POST $(API_URL)/promo/1/activate \
	#   -H "Content-Type: application/json" \
	#   -d '{"email": "user$$i@example.com"}' | jq; \
	# done
