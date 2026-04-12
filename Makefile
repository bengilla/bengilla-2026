VPS_HOST = root@8.218.88.230
VPS_DIR = /www/bengilla

deploy:
	ssh $(VPS_HOST) "cd $(VPS_DIR) && git pull && npm run build && pm2 restart bengilla"

dev:
	cd /Users/bengilla/Documents/DXP2800/github/bengilla-2026 && npm run dev

run:
	cd /Users/bengilla/Documents/DXP2800/github/bengilla-2026 && npm run dev

.PHONY: deploy dev run
