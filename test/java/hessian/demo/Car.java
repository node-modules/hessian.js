package hessian.demo;

import java.io.Serializable;

public class Car implements Serializable {
	String a = "a";
	String c = "c";
	String b = "b";
	String model = "Beetle";
	String color = "aquamarine";
	int mileage = 65536;

	public Car(String model) {
		this.model = model;
	}

	public Car() {

	}
}
