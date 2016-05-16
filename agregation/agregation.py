# -*- coding: utf-8 -*-
import json
import os

class Agregation_plz_bfs_v2():

	def __init__(self):
		self.path = os.path.dirname(os.path.realpath(__file__)) + '/'
		self.bfs_dict = {}
		self.data = ''
		self.plz_and_pop = {}
		self.tot_pop_estimation = 0

	def create_bfs_dict(self):
		with open(self.path + "bfs_and_pop.csv") as f:
			for line in f.read().split('\r'):
				els = line.split(';')
				bfs = els[0]
				name = els[1]
				pop = int(els[2])
				self.bfs_dict[bfs] = {
					'pop': pop,
					'division': 0
				}

	def create_data(self):

		plz_max_percent = {}

		with open(self.path + "plz_and_bfs.csv") as f:
			lines = f.read().split('\r')

			for line in lines:
				elements = line.split(';')
				plz = elements[0]
				percent = float(elements[1])
				bfs = elements[2]
				canton = elements[3]
				commune = elements[4]
			
				self.bfs_dict[bfs]['division'] += percent
		
				if plz not in self.plz_and_pop:

					plz_max_percent[plz] = percent

					self.plz_and_pop[plz] = {
						'pop': 0,
						'canton': canton,
						'commune': commune,
						'bfs': {bfs: percent}
					}

				else:
					self.plz_and_pop[plz]['bfs'][bfs] = percent
					if percent > plz_max_percent[plz]:
						self.plz_and_pop[plz]['canton'] = canton
						self.plz_and_pop[plz]['commune'] = commune

			for key in self.plz_and_pop:
				for bfs in self.plz_and_pop[key]['bfs']:

					percent_of_bfs = self.plz_and_pop[key]['bfs'][bfs] / 100.0
					pop_of_bfs = self.bfs_dict[bfs]['pop'] / float(self.bfs_dict[bfs]['division']) * 100

					self.plz_and_pop[key]['pop'] += int(percent_of_bfs * pop_of_bfs)

				self.tot_pop_estimation += self.plz_and_pop[key]['pop']
			

	def save(self):
		with open(self.path + 'plz_data.json', 'w') as f:
			json.dump(self.plz_and_pop, f)

	def process(self):
		self.create_bfs_dict()
		self.create_data()
		self.save()
		print 'tot pop estimation: ' + str(self.tot_pop_estimation)


a = Agregation_plz_bfs_v2()
a.process()



