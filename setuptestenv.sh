#!/usr/bin/env sh

node_version=8.9.3
directory="${PWD}/AWS Backend"

usage () {
    echo "Usage: $0 [-h | --help] [-r | --remove-node]" >&2
}

while getopts hr-: arg; do
    case ${arg} in
        h)
            SHOW_HELP=true ;;
        r)
            REMOVE_NODE=true ;;
        -)
            LONG_OPTARG="${OPTARG#*=}"
            case $OPTARG in
                help)
                    SHOW_HELP=true;;
                remove-node)
                    REMOVE_NODE=true ;;
                help* | remove-node*)
                    echo "No arg allowed for --$OPTARG option" >&2
                    exit 2
                    ;;
                '')
                    break ;;
                * )
                    echo "Illegal option --$OPTARG" >&2
                    exit 2
                    ;;
            esac
            ;;
        \? )
            usage
            exit 2
            ;;
    esac
done

if [ "$SHOW_HELP" = true ]; then
    usage
    exit 1
fi

if [ "$REMOVE_NODE" = true ]; then
    sudo rm -rf /usr/local/lib/node_modules/npm
    brew uninstall --force node
fi

if [ ! -d "${HOME}/.nvm" ]; then
    curl https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
    source "${HOME}/.nvm/nvm.sh"
    source "${HOME}/.profile"
    source "${HOME}/.bashrc"
    nvm install ${node_version}
fi

cd "${directory}"
npm prune
npm cache verify
npm install
