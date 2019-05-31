FROM rasa/rasa_nlu:0.14.0-spacy

RUN pip install https://github.com/explosion/spacy-models/releases/download/nl_core_news_sm-2.0.0/nl_core_news_sm-2.0.0.tar.gz --no-cache-dir > /dev/null \
    && python -m spacy link nl_core_news_sm nl

COPY ./rasa_config.yml /app/config.yml

EXPOSE 5000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["start", "-c", "config.yml", "--path", "/app/projects"]
