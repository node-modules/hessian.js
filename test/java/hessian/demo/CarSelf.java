package hessian.demo;

import java.io.Serializable;

public class CarSelf implements Serializable {
	String color = "aquamarine";
	String model = "Beetle";
	int mileage = 65536;
	CarSelf self = this;
	CarSelf prev = null;

	public CarSelf(CarSelf prev) {
		this.prev = prev;
	}

	public CarSelf() {
	}
}
