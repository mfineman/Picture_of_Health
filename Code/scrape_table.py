from splinter import Browser
from bs4 import BeautifulSoup as bs
import pandas as pd
import time

def browserSetup ():
    executable_path = {'executable_path': 'chromedriver.exe'}
    browser = Browser('chrome', **executable_path, headless=False)
    return browser

def scrape():
    browser = browserSetup()
    url = "https://www.americashealthrankings.org/explore/annual"
    browser.visit(url)
    time.sleep(1)
    
    browser.links.find_by_text('National Overall')
    html = browser.html
    soup = bs(html,'html.parser')
    table =soup.find_all('table')

    table=pd.read_html(str(table[1]))
    df_health_rank=table[0]
     
    from sqlalchemy import create_engine   
        
    from config import password

    engine = create_engine(f"postgresql://postgres:{password}@localhost:5432/Poverty_and_wellness")
    conn = engine.connect()

    df_health_rank.to_sql('state_health_rankings', conn, index=False, if_exists='replace')
    
scrape()


