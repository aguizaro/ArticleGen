import os
import time
import subprocess

path = os.environ.get("ARTICLEPATH")
log_dir = os.path.join(path, "collections_log")


def run_collection():
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)

    date = time.strftime("%d-%m-%Y")
    log_file = os.path.join(log_dir, f"{date}.txt")

    # Using subprocess for better control and error handling
    with open(log_file, "w") as f:
        subprocess.run(
            ["node", f"{path}collectArticles.js"], stdout=f, stderr=subprocess.STDOUT
        )


if __name__ == "__main__":
    run_collection()
