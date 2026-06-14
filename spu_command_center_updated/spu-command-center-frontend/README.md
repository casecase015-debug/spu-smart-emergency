# SPU Command Center Frontend

## Run locally

Start the Django API first:

```bash
cd ../spu_command_center_django
python3 -m pip install -r requirements.txt
python3 manage.py runserver 127.0.0.1:8000
```

Then start the frontend:

```bash
cd ../spu-command-center-frontend
npm install
npm run dev
```

Open `http://127.0.0.1:5173`.

Admin pages are available directly at `/admin` without a password gate.
