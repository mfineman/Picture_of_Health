from flask import Flask, render_template, redirect, jsonify
import numpy as np
import pandas as pd
import json

import os
import psycopg2
DATABASE_URL = os.environ['DATABASE_URL']

import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func, inspect


from config import password
# engine = create_engine(f"postgresql://postgres:{password}@localhost:5432/Poverty_and_wellness")
engine = psycopg2.connect(DATABASE_URL, sslmode='require')
session = Session(bind=engine)

# GET DATA FROM SQL and creating endpoints: 
# Approach 1: Use sqlalchemy reflection method to convert tables to python classes and query them
Base = automap_base()
Base.prepare(engine, reflect=True)

# Save reference to the table
povState = Base.classes.poverty
eduState = Base.classes.education

# start the flask server
app=Flask(__name__)

@app.route("/states")
def states():
    # link  to the DB
    session = Session(engine)
   # Query all states
    results = session.query(povState.state).all()
    session.close()
    # Convert list of tuples into normal list
    all_states = list(np.ravel(results))

    return jsonify(all_states)

#/
@app.route("/poverty")
def poverty():
    
    session = Session(engine)
  
    results = session.query(povState.pov_rate).all()
    session.close()
    
    all_pov = list(np.ravel(results))
  
    return jsonify(all_pov)


@app.route("/education")
def education():
    
    session = Session(engine)
  
    results = session.query(eduState.college_per).all()
    session.close()

    # Convert list of tuples into normal list
    all_edu = list(np.ravel(results))

    return jsonify(all_edu)

# A different approach to getting the data from sql: Connect to the database and use pandas to read tables
# into dataframes and then create objects from there
@app.route("/")
def index():
    
    rank_data_df = pd.read_sql_query("Select * from state_health_rankings",  conn)
    rank_data_df.drop("rank", inplace=True, axis=1) 
    slim_df=rank_data_df.drop([rank_data_df.index[-1], rank_data_df.index[-2]]) 
    slim_df.rename(columns = {"score":"Variance from Nat'l Average", 'state':'State'}, inplace = True) 
    rank_table=slim_df.to_html(index=False)
    
    return render_template("index.html", table=rank_table)

    
@app.route("/map_data",methods=["GET","POST"])
def map_data():

    map_data_df = pd.read_sql("Select * from map_coordinates",conn)
    map_data_df.rename(columns = {'long':'lon'}, inplace = True) 
    map_data_dict=map_data_df.to_dict(orient='records')
    map_json = jsonify(map_data_dict)

    return(map_json)

@app.route("/crime_data")
def crime_data():
    crime_data_df = pd.read_sql("Select * from violent_crime",conn)
    crime_data_df.rename(columns = {'abbr':'State_Abbreviation','state': 'State', 'pop': 'Population', 
    'vio_crime': 'Violent_Crime','vio_rate':'Violent_Crime_Rate','vio_rank':'Violent_Crime_Rank'}, inplace = True) 
    crime_data_dict=crime_data_df.to_dict(orient='records')
    crime_json = jsonify(crime_data_dict)

    return crime_json

# Approach 3: apply sqlalchemy engine.execute method to manipulate sql tables directly without reflection:
@app.route("/food_deserts",methods=["GET","POST"])
def food_deserts():
    # engine = create_engine(f"postgresql://postgres:{password}@localhost:5432/Poverty_and_wellness")
    engine = psycopg2.connect(DATABASE_URL, sslmode='require')
    session = Session(bind=engine)
    food_data = engine.execute('SELECT f.state, f.abbr, f.desert_rate, p.pov_rate from food_deserts as f INNER JOIN poverty as p ON f.state = p.state').fetchall()

    food_dict_list=[] 
    for state in food_data: 
   
        food_dict = {} 
        food_dict["state"] = state[0]
        food_dict["abbr"] = state[1]
        food_dict["desert_rate"]=state[2]
        food_dict["desert_rank"]=(sorted(food_data, key = lambda x: x[2],reverse=True)).index(state)+1
        food_dict["pov_rate"]=state[3]
        food_dict["pov_rank"]=(sorted(food_data, key = lambda x: x[3],reverse=True)).index(state)+1

        food_dict_list.append(food_dict)

    food_json=json.dumps(food_dict_list, indent=4, sort_keys=True)
    return(food_json)

@app.route("/combined_data")
def combined_data():

    # engine = create_engine(f"postgresql://postgres:{password}@localhost:5432/Poverty_and_wellness")
    engine = psycopg2.connect(DATABASE_URL, sslmode='require')
    session=Session(engine)
    combined_data = engine.execute('SELECT e.state, e.college_per, f.desert_rate, s.score, p.pov_rate, v.vio_rate from education as e INNER JOIN food_deserts as f ON e.state = f.state INNER JOIN state_health_rankings as s ON f.state = s.state INNER JOIN poverty as p ON s.state = p.state INNER JOIN violent_crime as v ON p.state = v.state ORDER BY e.state').fetchall()

    combined_dict_list=[] 
    for state  in combined_data: 
   
        combined_dict = {} 
        combined_dict["State"] = state[0]
        combined_dict["College Grad Rate"] = state[1]
        combined_dict["College Grad Rank"]=(sorted(combined_data, key = lambda x: x[1],reverse=True)).index(state)+1
        combined_dict["Food Desert Rate"] = state[2]
        combined_dict["Food Desert Rank"]=(sorted(combined_data, key = lambda x: x[2],reverse=True)).index(state)+1
        combined_dict["Health Score"] = state[3]
        combined_dict["Health Rank"]=(sorted(combined_data, key = lambda x: x[3],reverse=True)).index(state)+1
        combined_dict["Poverty Rate"] = state[4]
        combined_dict["Poverty Rank"]=(sorted(combined_data, key = lambda x: x[4],reverse=True)).index(state)+1
        combined_dict["Violent Crime Rate"]=state[5]
        combined_dict["Violent Crime Rank"]=(sorted(combined_data, key = lambda x: x[5],reverse=True)).index(state)+1
      
        combined_dict_list.append(combined_dict)
   
    combined_json=json.dumps(combined_dict_list, indent=4, sort_keys=True)
    return(combined_json)

if __name__ == "__main__":
    app.run(debug=True)

  

 