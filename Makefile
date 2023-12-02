all:
	docker compose down && chmod +x start.sh && ./start.sh
stop:
	docker compose down