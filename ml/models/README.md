Trained model artifacts (.joblib files) are stored here after running ml/train.py.
These files are git-ignored (binary blobs). Run:

    python ml/seed.py

to train and seed in one step. Or:

    python ml/train.py   # train only
    python ml/seed.py    # seed DB (calls train.py if model missing)
