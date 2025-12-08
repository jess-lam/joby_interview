# Installation Troubleshooting

## psycopg2-binary Installation Error

If you encounter an error about `pg_config` not found when installing `psycopg2-binary`, you need to install PostgreSQL client libraries.

### Solution 1: Install PostgreSQL via Homebrew (Recommended)

1. Install Homebrew (if not already installed):
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

2. Install PostgreSQL client libraries:
```bash
brew install postgresql
```

3. Try installing requirements again:
```bash
pip install -r requirements.txt
```

### Solution 2: Use System Python with PostgreSQL

If you have PostgreSQL installed via another method, ensure `pg_config` is in your PATH:
```bash
export PATH="/usr/local/pgsql/bin:$PATH"
# or wherever your PostgreSQL is installed
```

### Solution 3: Alternative - Use psycopg2 (instead of binary)

If the above doesn't work, you can try installing `psycopg2` directly (still requires PostgreSQL libraries):
```bash
# First install PostgreSQL libraries (via Homebrew or other method)
brew install postgresql

# Then install psycopg2
pip install psycopg2
```

### Solution 4: Use Docker for Development

Since you're using Docker for PostgreSQL, you could also use a Docker container for the backend development environment, which would have all dependencies pre-installed.

## Python 3.14 Compatibility Note

Python 3.14 is very new, and some packages may not have pre-built wheels yet. If you continue to have issues, consider using Python 3.11 or 3.12, which have better package compatibility.


