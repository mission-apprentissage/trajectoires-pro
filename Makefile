
install:
	yarn install --frozen-lockfile
	yarn --cwd server install --frozen-lockfile

start:
	docker compose up --build --force-recreate

stop:
	docker compose stop

test:
	yarn --cwd server test

coverage:
	yarn --cwd server coverage

lint:
	yarn --cwd server lint

clean:
	docker compose kill && docker system prune --force --volumes

ci: install lint coverage
