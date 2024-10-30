# Onlyfeet

Web hacking challenge developed for my yearly workshop on offensive security for web (1).

## Setup

1. Create and prepare `src/users.json`
2. Set `FLAG` in `.env`
2. Create Azure container registry `cronlyfeet`
3. Build and deploy image

	```bash
	docker login cronlyfeet.azurecr.io
	docker build . -t onlyfeet
	docker tag onlyfeet:latest cronlyfeet.azurecr.io/onlyfeet:latest
	docker push cronlyfeet.azurecr.io/onlyfeet:latest
	```

4. Create Azure web app for containers `app-onlyfeet`
